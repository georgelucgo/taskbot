const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { collection, addDoc, doc, getDocs } = require("firebase/firestore");
const db = require("./database"); // Arquivo onde Firestore está configurado

const client = new Client();

client.once('ready', () => {
    console.log('Bot está pronto!');
});

// Gerar QR Code
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});


// // Busca o maior ID atual e adiciona a nova tarefa  
// tarefasCollection.orderBy("id", "desc").limit(1).get()    
// .then((querySnapshot) => {      
//     let novoId = 1; // Caso não existam tarefas ainda
// if (!querySnapshot.empty) {        
// 	const maiorTarefa = querySnapshot.docs[0];        
// 	novoId = maiorTarefa.data().id + 1; // Incrementa o maior ID      
// 	}
// })
// Referência para a coleção
const tarefasCollection = collection(db, "tarefas");

client.on('message_create', async (message) => {
    const regex = /^\/tarefas\s+"(.+?)"\s+((\d{2})\/(\d{2})\/(\d{4}))$/;
    const match = message.body.match(regex); // Verifica se bate com a mensagem

    if (match) {
        const tarefa = match[1]; // Captura a tarefa
        const dataF = match[2];
        const dia = parseInt(match[3], 10);
        const mes = parseInt(match[4], 10);
        const ano = parseInt(match[5], 10);

        // Criação da data corretamente
        const data = new Date(ano, mes - 1, dia); // Ajuste no mês (indexado em zero)

        try {
            // Adicionando na coleção com ID automático
            const docRef = await addDoc(tarefasCollection, {
                tarefa: tarefa,
                dataF: dataF,
                data: data,
                concluido: false
            });

            console.log("Documento adicionado com ID:", docRef.id);

            // Envia a mensagem de confirmação
            client.sendMessage(message.from, `${tarefa} cadastrada para o dia ${data.toLocaleDateString("pt-BR")}`);
        } catch (error) {
            console.error("Erro ao adicionar documento:", error);
            client.sendMessage(message.from, "Houve um erro ao cadastrar a tarefa. Tente novamente.");
        }
    }
	
	if (message.body === '/listar') {
		try {
			const querySnapshot = await getDocs(tarefasCollection);
			if (querySnapshot.empty) {
				client.sendMessage(message.from, "Nenhuma tarefa encontrada.");
				return;
			}
	
			let tarefasList = "Lista de Tarefas:\n";
			querySnapshot.forEach((doc) => {
				const tarefa = doc.data();
				tarefasList += `- ${tarefa.tarefa} (Data: ${new Date(tarefa.data.seconds * 1000).toLocaleDateString("pt-BR")})\n`;
			});
	
			client.sendMessage(message.from, tarefasList);
		} catch (error) {
			console.error("Erro ao listar documentos:", error);
			client.sendMessage(message.from, "Houve um erro ao listar as tarefas. Tente novamente.");
		}
	}
	

    if (message.body === '!ping') {
        client.sendMessage(message.from, 'pong');
    }
});

// Inicializar o cliente
client.initialize();