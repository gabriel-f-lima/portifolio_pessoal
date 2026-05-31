import os
from datetime import datetime
from functools import wraps
from flask import Flask, render_template, request, session, redirect, url_for, jsonify
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

# Carrega as variáveis do .env
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'chave-super-secreta')

# ==========================================
# CONFIGURAÇÃO DO BANCO DE DADOS
# ==========================================
# Puxa a URL do .env. Se não tiver (para testar localmente), cria um banco SQLite.
db_url = os.getenv('DATABASE_URL', 'sqlite:///portfolio.db')

# O Render as vezes usa "postgres://" que o SQLAlchemy mais novo não aceita. 
# Esse código corrige automaticamente para "postgresql://"
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ==========================================
# MODELO DA TABELA DE MENSAGENS
# ==========================================
class Mensagem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    assunto = db.Column(db.String(150), nullable=False)
    texto = db.Column(db.Text, nullable=False)
    data_envio = db.Column(db.DateTime, default=datetime.utcnow)

# Cria a tabela no banco automaticamente caso não exista
with app.app_context():
    db.create_all()

# Credenciais de Admin
ADMIN_USERNAME = os.getenv('ADMIN_USERNAME')
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD')

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('logged_in'):
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# ==========================================
# ROTAS PÚBLICAS E API
# ==========================================
@app.route('/')
def index():
    return render_template('index.html')

# Rota para receber os dados do formulário via JavaScript (AJAX)
@app.route('/api/contato', methods=['POST'])
def enviar_contato():
    nome = request.form.get('name')
    email = request.form.get('email')
    assunto = request.form.get('subject')
    texto = request.form.get('message')

    # Validação simples
    if not all([nome, email, assunto, texto]):
        return jsonify({"sucesso": False, "erro": "Preencha todos os campos!"}), 400

    try:
        # Salva no banco de dados
        nova_mensagem = Mensagem(nome=nome, email=email, assunto=assunto, texto=texto)
        db.session.add(nova_mensagem)
        db.session.commit()
        return jsonify({"sucesso": True, "mensagem": "Sua mensagem foi enviada com sucesso!"})
    except Exception as e:
        return jsonify({"sucesso": False, "erro": "Erro ao salvar no banco de dados."}), 500

# ==========================================
# ROTAS DO ADMIN
# ==========================================
@app.route('/login', methods=['GET', 'POST'])
def login():
    erro = None
    if request.method == 'POST':
        user = request.form.get('username')
        senha = request.form.get('password')
        
        if user == ADMIN_USERNAME and senha == ADMIN_PASSWORD:
            session['logged_in'] = True
            return redirect(url_for('dashboard'))
        else:
            erro = "Credenciais inválidas. Tente novamente."
            
    return render_template('login.html', erro=erro)

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    return redirect(url_for('index'))

@app.route('/dashboard')
@login_required
def dashboard():
    # Busca todas as mensagens no banco, da mais nova para a mais velha
    mensagens_bd = Mensagem.query.order_by(Mensagem.data_envio.desc()).all()
    return render_template('dashboard.html', mensagens=mensagens_bd)

@app.route('/api/mensagem/<int:msg_id>', methods=['DELETE'])
@login_required
def deletar_mensagem(msg_id):
    # Busca a mensagem pelo ID. Se não achar, retorna erro 404.
    mensagem = Mensagem.query.get_or_404(msg_id)
    
    try:
        db.session.delete(mensagem)
        db.session.commit()
        return jsonify({"sucesso": True})
    except Exception as e:
        return jsonify({"sucesso": False, "erro": "Erro ao deletar do banco de dados."}),

if __name__ == "__main__":
    app.run(debug=True)