const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client();

client.once('ready', () => {
    console.log('Bot está pronto!');
});

// Gerar QR Code
client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});



client.on('message_create', message => {	
const regex = /^\/tarefas\s+"(.+?)"\s+(\d{2}\/\d{2}\/\d{4})$/;
const match = message.body.match(regex) // Verifica se bate com a mensagem

if(match){
	var tarefa = match[1]; //Captura a tarefa que está em ()
	var data = match[2] // Captura a data que está em ()

	client.sendMessage(message.from, `${tarefa} cadastrada para o dia ${data}`)
}

	if (message.body === '!ping') {
		client.sendMessage(message.from, 'pong');
	}
});
// Start your client
client.initialize();