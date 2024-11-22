client.on('message_create', message => {	
const regex = /^\/tarefas\s+"(.+?)"\s+((\d{2})\/\d{2}\/\d{4})$/;
const match = message.body.match(regex) // Verifica se bate com a mensagem
var tarefa = match[1]; //Captura a tarefa que está em ()
var data = match[2]
var n = match[3]
console.log(`Tarefa: ${tarefa};  Data: ${data};  n: ${n}`);



function data(dia, mes, ano) {
}
if(match){
	 // Captura a data que está em ()

	client.sendMessage(message.from, `${tarefa} cadastrada para o dia ${data}`)
}

	if (message.body === '!ping') {
		client.sendMessage(message.from, 'pong');
	}
});