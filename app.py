import json
import os
from flask import Flask, render_template, jsonify, request
from mailer import sendMail

app = Flask(__name__, static_folder='assets')
app.config['UPLOAD_FOLDER'] = 'temp'

def commit(name, data):
    with open('storage/'+name+'.json', 'w') as store:
        store.write(json.dumps(data))
        store.close()        

users = {}
config = {}
templates = {}

with open('storage/userslists.json', 'r') as ul:
    users = json.loads(ul.read())
    ul.close()

with open('storage/mail.json') as cfg:
    config = json.loads(cfg.read())
    cfg.close()

with open('storage/templates.json') as tpls:
    templates = json.loads(tpls.read())
    tpls.close()

@app.route('/')
def main():
    return render_template('index.html')

@app.route('/getUsersLists')
def userslists():
    return jsonify(users)

@app.route('/getConfig')
def returnCfg():
    return jsonify(config)

@app.route('/getTemplates')
def returnTpls():
    return jsonify(templates)

@app.route('/commitConfig', methods=['POST'])
def commitCfg():
    global config
    config = request.get_json(force=True)
    commit('mail', config)
    return 'ok'

@app.route('/commitUsersLists', methods=['POST'])
def commitUl():
    if len(dict(request.files)) == 1:
        filt = request.files['file']
        filt.save(os.path.join(app.config['UPLOAD_FOLDER'], filt.filename))
        with open(os.path.join(app.config['UPLOAD_FOLDER'], filt.filename), 'r') as txt:
            users.update(json.loads(txt.read()))
            commit('userslists', users)
            txt.close()
            os.remove(os.path.join(app.config['UPLOAD_FOLDER'], filt.filename))
    else:
        users.update(request.get_json(force=True))
    commit('userslists', users)
    return jsonify(users)

@app.route('/commitTemplates', methods=['POST'])
def commitTpls():
    if len(dict(request.files)) == 1:
        filt = request.files['file']
        filt.save(os.path.join(app.config['UPLOAD_FOLDER'], filt.filename))
        with open(os.path.join(app.config['UPLOAD_FOLDER'], filt.filename), 'r') as txt:
            templates.update(json.loads(txt.read()))
            commit('templates', templates)
            txt.close()
            os.remove(os.path.join(app.config['UPLOAD_FOLDER'], filt.filename))
    else:
        templates.update(request.get_json(force=True))
    commit('templates', templates)
    return jsonify(templates)

@app.route('/deleteUsersList', methods=['POST'])
def rmUl():
    del users[request.get_json(force=True)['name']]
    commit('userslists', users)
    return 'ok'

@app.route('/deleteTemplate', methods=['POST'])
def rmTpl():
    del templates[request.get_json(force=True)['name']]
    commit('templates', templates)
    return 'ok'

@app.route('/sendmail', methods=['POST'])
def send_mail():
    info = request.get_json(force=True)
    info['receivers'] = users[info['name']]
    sendMail(config, info['receivers'], info['subject'], info['text'])
    return 'ok'

if __name__ == '__main__':
    app.run()