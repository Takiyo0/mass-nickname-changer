import { Client, Message, Intents } from "discord.js";
import { TOKEN, PREFIX } from "./config.json";
import Manager from "./modules/Manager";

const { DIRECT_MESSAGES, GUILDS, GUILD_MEMBERS, GUILD_MESSAGES } = Intents.FLAGS;

const client: Client = new Client({
    intents: [DIRECT_MESSAGES, GUILDS, GUILD_MEMBERS, GUILD_MESSAGES]
});

client.on("ready", (): void => {
    console.log(`${client.user ? client.user.tag : "Unknown#0000"} is ready!`);
    client.user?.setActivity("your name", { type: "WATCHING" });
});

const manager: Manager = new Manager(client);

client.on("messageCreate", async (message: Message): Promise<any> => {
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args: string[] = message.content.slice(PREFIX.length).split(/ +/);
    const command: string = args.shift()?.toLowerCase() || "";

    switch (command) {
        case "ping":
            return message.channel.send(`Pong! ${client.ws.ping}ms`);
        case "say":
            return message.channel.send(args.join(" "));

        case "start": {
            const msg: Message = await message.channel.send("Processing...");
            if (!args[0]) return msg.edit("Please provide the first name");
            if (!args[1]) return msg.edit("Please provide the last name");

            const result: Manager | { message: string } = await manager.start(message.guild!, { firstName: args[0], lastName: args[1] }, msg);
            if (result instanceof Manager) return msg.edit(`Finished changing nickname for ${message.guild?.name}`);
            return msg.edit({ content: result.message });
        }

        case "clear": {
            const msg: Message = await message.channel.send("Processing...");
            if (!args[0]) return msg.edit("Please provide the first name");
            if (!args[1]) return msg.edit("Please provide the last name");

            const result: Manager | { message: string } = await manager.removeName(message.guild!, { firstName: args[0], lastName: args[1] }, msg);
            if (result instanceof Manager) return msg.edit(`Finished clearing nickname for ${message.guild?.name}`);
            return msg.edit({ content: result.message });
        }

        case "reset": {
            const msg: Message = await message.channel.send("Processing...");

            const result: Manager | { message: string } = await manager.resetName(message.guild!, msg);
            if (result instanceof Manager) return msg.edit(`Finished resetting nickname for ${message.guild?.name}`);
            return msg.edit({ content: result.message });
        }

        default:
            return message.channel.send(`Unknown command: ${command}`);

    }
});

client.login(TOKEN);