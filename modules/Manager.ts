import { Client, Snowflake, Guild, Collection, GuildMember, Message } from "discord.js";
import GuildManager from "./GuildManager";

export default class Manager {
    client: Client;
    queue: Map<Snowflake, GuildManager>;

    constructor(client: Client) {
        this.client = client;
        this.queue = new Map<Snowflake, GuildManager>();
    }

    async start(guild: Guild, { firstName, lastName }: { firstName: string, lastName: string }, msg: Message): Promise<Manager | { message: string }> {
        if (this.queue.get(guild.id)) return { message: "Guild is already being processed" };
        const members: Collection<string, GuildMember> = await guild.members.fetch();
        const filteredMembers = members.filter((member: GuildMember) => !member.nickname?.startsWith(firstName) && !member.nickname?.endsWith(lastName));
        const manager = new GuildManager(guild, filteredMembers, msg, "add");
        this.queue.set(guild.id, manager);
        await manager.start({ firstName, lastName });
        this.queue.delete(guild.id);
        return this;
    }

    async removeName(guild: Guild, { firstName, lastName }: { firstName: string, lastName: string }, msg: Message): Promise<Manager | { message: string }> {
        if (this.queue.get(guild.id)) return { message: "Guild is already being processed" };
        const members: Collection<string, GuildMember> = await guild.members.fetch();
        const filteredMembers = members.filter((member: GuildMember) => !!member.nickname?.startsWith(firstName) && !!member.nickname?.endsWith(lastName));
        const manager = new GuildManager(guild, filteredMembers, msg, "remove");
        this.queue.set(guild.id, manager);
        await manager.start({ firstName, lastName });
        this.queue.delete(guild.id);
        return this;
    }

    async resetName(guild: Guild, msg: Message): Promise<Manager | { message: string }> {
        if (this.queue.get(guild.id)) return { message: "Guild is already being processed" };
        const members: Collection<string, GuildMember> = await guild.members.fetch();
        const manager = new GuildManager(guild, members, msg, "reset");
        this.queue.set(guild.id, manager);
        await manager.start({ firstName: "", lastName: "" });
        this.queue.delete(guild.id);
        return this;
    }
}