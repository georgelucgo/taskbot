const { Client, NoAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { collection, addDoc, doc, getDocs, query, orderBy, limit, deleteDoc, where, updateDoc } = require("firebase/firestore");
const db = require("./database"); // Arquivo onde Firestore está configurado

const client = new Client({
});

client.once('ready', () => {
    console.log('Bot está pronto!');
});

// Gerar QR Code
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

const tarefasCollection = collection(db, "tarefas");



client.on('message_create', async (message) => {

	// Método Cadastrar 
    const regex = /^\/tarefas\s+"(.+?)"\s+(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = message.body.match(regex); // Verifica se bate com a mensagem

    if (match) {
        const tarefa = match[1]; // Captura a tarefa
		var tarefaFormatada = tarefa[0].toUpperCase() + tarefa.substring(1); // Formatando a para a primeira letra ser maiúscula

		//Criando a data
        const dia = parseInt(match[2]);
        const mes = parseInt(match[3]);
        const ano = parseInt(match[4]);
		const hora = 23;
		const minutos = 59;
        const data = new Date(ano, mes - 1, dia, hora, minutos); // No Javascript o mês começa em 0
		

		//Criando id numérico
		const q = query(tarefasCollection, orderBy("id", "desc"), limit(1)); // Busca maior id atual, apenas um único elemento
		const querySnapshot = await getDocs(q);

		let novoId = 1; // Caso não existam tarefas

		if (!querySnapshot.empty) { // Caso não esteja vazio
			const maiorTarefa = querySnapshot.docs[0]; // Só existe apenas um elemento cujo vai estar na posição 0
			novoId = maiorTarefa.data().id + 1; // Incrementa o maior ID
		}
		
		async function cadastrarTarefa(id, tarefa, data){
			try {
				// Adicionando na coleção com ID automático
				const docRef = await addDoc(tarefasCollection, {
					id: id,
					tarefa: tarefa,
					data: data.toLocaleDateString("pt-BR"),
					concluido: false,
					created: new Date()
				});
		
				console.log("Documento adicionado com ID:", id);
				// Envia a mensagem de confirmação
				client.sendMessage(message.from, `${tarefa} cadastrada para o dia ${data.toLocaleDateString("pt-BR")}`);
				listarTarefas();
			} catch (error) {
				console.error("Erro ao adicionar documento:", error);
				client.sendMessage(message.from, "Houve um erro ao cadastrar a tarefa. Tente novamente.");
			}
		}

		cadastrarTarefa(novoId, tarefaFormatada, data)
    }
	// Fim do Método Cadastrar


	// Método Listar 
	async function listarTarefas(){
		try{
			const q = query(tarefasCollection, orderBy("id", "asc"), )
			const querySnapshot = await getDocs(q);
			if(querySnapshot.empty){
				client.sendMessage(message.from, "Nenhuma tarefa encontrada.");
				return
			}
			var mensagem = "*Lista de Tarefas*\n"

			querySnapshot.forEach((doc)=>{
				const tarefa = doc.data();
				mensagem += `${tarefa.id}. ${tarefa.tarefa} - ${tarefa.data}\n`;
			})

			client.sendMessage(message.from, mensagem);
		}
		catch(error){
			console.error("Erro ao listar documentos:", error);
			client.sendMessage(message.from, "Houve um erro ao listar as tarefas. Tente novamente.");
		}
		
	}

	if (message.body === '/listar') {
		listarTarefas();
	}

	// Fim do Método Listar


	// Método Editar
	async function editarTarefas(id, tarefa, data){
			const q = query(tarefasCollection, where("id", "==", parseInt(id))); // Busca o campo 'id'
			const querySnapshot = await getDocs(q);
			if (!querySnapshot.empty) {
				const docRef = doc(db, "tarefas", querySnapshot.docs[0].id);
				await updateDoc(docRef, {
					id: parseInt(id),
					tarefa: tarefa,
					data: data.toLocaleDateString("pt-BR")
				})
				client.sendMessage(message.from, `Tarefa ${id} atualizada com sucesso!`);
			}else {
				// Caso o documento não seja encontrado
				client.sendMessage(message.from, `Tarefa com ID ${id} não encontrada.`);
			}
		
	}

	const editarRegex = /^\/editar\s+(\d+)\s+"(.+?)"\s+(\d{2})\/(\d{2})\/(\d{4})$/
	const editarMatch = message.body.match(editarRegex)
	//Se a mensagem for igual
	if (editarMatch) {
		const idEditar = editarMatch[1];
		const tarefaEditar = editarMatch[2];
		let diaEdit = parseInt(editarMatch[3]);
        let mesEdit = parseInt(editarMatch[4]);
        let anoEdit = parseInt(editarMatch[5]);
		let horaEdit = 23;
		let minutosEdit = 59;
        const data = new Date(anoEdit, mesEdit - 1, diaEdit, horaEdit, minutosEdit);
		editarTarefas(idEditar, tarefaEditar, data);
	}
	// Fim do Método Editar



	// Método de Deletar
	async function deletarTarefas(idTarefa){
		try{
		const q = query(tarefasCollection, where("id", "==", parseInt(idTarefa))); // Busca o campo 'id'
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const docRef = doc(tarefasCollection, querySnapshot.docs[0].id); // Usando o ID do documento do Firestore
            await deleteDoc(docRef);
            console.log(`Tarefa com ID ${idTarefa} deletada.`);
            client.sendMessage(message.from, "Tarefa deletada com sucesso");
			listarTarefas();
        } else {
            // Caso o documento não seja encontrado
            client.sendMessage(message.from, `Tarefa com ID ${idTarefa} não encontrada.`);
        }
    	} catch (error) {
        console.error("Erro ao deletar tarefa:", error);
        client.sendMessage(message.from, `Erro ao deletar a tarefa ${idTarefa}. Verifique se o ID é válido.`);
    	}
		
	}


	//Capturando mensagem
	const deletarRegex = /^\/deletar\s+(\d+)$/
	const deletarMatch = message.body.match(deletarRegex)
	//Se a mensagem for igual
	if (deletarMatch) {
		const idTarefa = deletarMatch[1];
		deletarTarefas(idTarefa);
	}

	// Fim do Método deletar




	// function avisoTarefa(id){
	// 	// Faltando 1 dia para tarefa ser finalizada vai chamar essa função
	// 	// Criar um meio de avisar
	// 	client.sendMessage(message.from, `${tarefa} vai se encerrar daqui 1 dia!!`)
	// }

	// //Fora do função ela tem que ser chamada
	// //Algo tipo assim

	// if(dataFaltando === 1){  
	// 	avisoTarefa(tarefa.id);
	// }


	// function tarefaFinalizada(){
	// 	//Temos cadastrada a conclusão, basicamente vamos buscar e deletar
	// 	//Algo tipo assim:

	// 	//if(Date.now() == tarefa.data){
	// 		//tarefas.concluido = true;
	// 		client.sendMessage(message.from, `${tarefas.tarefa} encerrou o seu prazo!`)
	// 	}

	// }

	// tarefaFinalizada()


    if (message.body === '!ping') {
        client.sendMessage(message.from, 'pong');
    }
});

// Inicializar o cliente
client.initialize();