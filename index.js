require('dotenv').config({path: './puerto.env'});
const Discord = require('discord.js');
const fs = require('fs');
const client = new Discord.Client();

const app = require('./src');

client.login(process.env.TOKEN).then( () => {
    client.on('message', mensaje => {
        
        if (mensaje.content.includes('p!')) {

            let args = [];
            let comando = mensaje.content.split('p!')[1];

            // SI EL STRING TIENE ESPACIOS
            if (/\s/.test(comando)) {

                args = comando.split(' '); // DIVIDIMOS EN ARRAYS POR ESPACIOS
                comando = args.shift(); // SACAMOS EL PRIMER ITEM QUE SERÍA EL COMANDO, LO DEMÁS SON LOS ARGUMENTOS QUE LE SIGUEN
            }

            if (comando.length > 1) {

                leerComando(comando, args, mensaje).then( (res) => {

                }).catch( (err) => {
                    mensaje.reply(err.message);
                });

            }
        }
    });

    client.on("ready", async () => {
        console.log("PTAKSAD bot by Radec");
        console.log("Node Version: " + process.version);
        console.log("Discord.js Version: " + Discord.version);

        await client.user.setActivity((client.guilds.cache.size).toString() + " servers !help", {type: "PLAYING"});
    });

    client.on("guildCreate", async () => {
        await client.user.setActivity((client.guilds.cache.size).toString() + " servers !help", {type: "PLAYING"});
    });
}).catch(console.error);

async function leerComando(comando, args, mensaje) {

    if(mensaje.member.id !== client.user.id) {
        switch (comando) {
            case 'help':
                let msg = "p!<frase>: dice alguna frase del canal (Ej: p!enfermo) (SÓLO FUNCIONA EN MODO MANUAL)\n" +
                    "p!manual: El bot solo va a funcionar por comando\n" +
                    "p!automatico <tiempo_en_segundos>: El bot va a ingresar a todos los canales cada X tiempo a reproducir un sonido al azar\n" +
                    "p!escuchar: El bot va a escucharte cada 10 segundos, 3 segundos (Deshabilitado momentaneamente por cuestiones de escalabilidad) \n" +
                    "p!sonidos: Muestra los sonidos disponibles para reproducir";
                mensaje.reply(msg);
                break;
            case 'automatico':
                app.automatico.modoAutomatico(true, args, mensaje);
                break;
            case 'manual':
                app.automatico.modoAutomatico(false, args, mensaje);
                break;

            case 'sonidos':

                let audios = [];

                await fs.readdir('./audios/', (err, archivos) => {

                    archivos.forEach(archivo => {
                        audios.push(archivo.replace('.mp3', ''));
                    });

                    mensaje.reply("Todos los sonidos que hay para reproducir son: " + audios.join(' - '));
                });

                break;

            //case 'escuchar': ahapp.escucr.agregarEscucha(mensaje); break;

            default:

                const voiceChannel = mensaje.member.voice.channel;

                if (!voiceChannel) throw new Error('Chacal metete a un chanel para escucharme');
                if (!fs.existsSync('./audios/' + comando + '.mp3')) throw new Error('Higuaín, sos vos?');

                // SI ESTÁ EN MODO AUTOMÁTICO
                const automatico = app.data.automatico.get(mensaje.guild.id);
                if (automatico) throw new Error('El bot está en modo automático rey, desactivalo con p!manual');

                try {
                    app.sonidos.agregarCola(comando, mensaje);
                } catch (err) {
                    throw new Error(err);
                }

                break;
        }
    }
}
