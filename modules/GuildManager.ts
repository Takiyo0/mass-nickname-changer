import { Guild, GuildMember, Message, Collection } from "discord.js";

export default class GuildManager {
    guild: Guild;
    queue: Map<number, GuildMember>;
    message: Message;
    type: "add" | "remove" | "reset";

    constructor(guild: Guild, members: Collection<string, GuildMember>, msg: Message, type: "add" | "remove" | "reset") {
        this.guild = guild;
        this.queue = new Map<number, GuildMember>();
        this.type = type;
        this.message = msg;

        members.forEach((member: GuildMember) => this.queue.set(this.queue.size, member));
    }

    async start({ firstName, lastName }: { firstName: string, lastName: string }): Promise<GuildManager> {
        switch (this.type) {
            case "add":
                return this._add({ firstName, lastName });
            case "remove":
                return this._remove({ firstName, lastName });
            case "reset":
                return this._reset();
        }
    }

    private async _add({ firstName, lastName }: { firstName: string, lastName: string }): Promise<GuildManager> {
        let size = this.queue.size;

        while (this.queue.size) {
            let [id, member]: [number, GuildMember] = this.queue.entries().next().value;

            if (member.nickname?.startsWith(firstName) && member.nickname?.endsWith(lastName)) {
                this.queue.delete(id);
                continue;
            }
            let beforeUpdate: string = member && member.nickname ? member.nickname : member.user.username;

            let updatedMember = await member.setNickname(`${firstName}${beforeUpdate}${lastName}`).catch(() => null);
            this.queue.delete(id);
            this.message.edit(`Changed ${id}/${size} nicknames. [\`${beforeUpdate} -> ${updatedMember ? updatedMember.nickname ? updatedMember.nickname : updatedMember.user.username : "Failed"}\`]`);
            await new Promise((resolve) => setTimeout(resolve, 1500));
        }

        return this;
    }

    private async _remove({ firstName, lastName }: { firstName: string, lastName: string }): Promise<GuildManager> {
        let size = this.queue.size;

        while (this.queue.size) {
            let [id, member]: [number, GuildMember] = this.queue.entries().next().value;

            if (!member.nickname?.startsWith(firstName) && !member.nickname?.endsWith(lastName)) {
                this.queue.delete(id);
                continue;
            }
            let beforeUpdate: string = member && member.nickname ? member.nickname : member.user.username;

            let updatedMember = await member.setNickname(beforeUpdate?.replace(firstName, "").replace(lastName, "")).catch(() => null);
            this.queue.delete(id);
            this.message.edit(`Changed ${id}/${size} nicknames. [\`${beforeUpdate} -> ${updatedMember ? updatedMember.nickname ? updatedMember.nickname : updatedMember.user.username : "Failed"}\`]`);
            await new Promise((resolve) => setTimeout(resolve, 1500));
        }

        return this;
    }

    private async _reset(): Promise<GuildManager> {
        let size = this.queue.size;

        while (this.queue.size) {
            let [id, member]: [number, GuildMember] = this.queue.entries().next().value;

            let beforeUpdate: string = member && member.nickname ? member.nickname : member.user.username;
            let updatedMember = await member.setNickname(member.user.username).catch(() => null);
            this.queue.delete(id);
            this.message.edit(`Changed ${id}/${size} nicknames. [\`${beforeUpdate} -> ${updatedMember ? updatedMember.nickname ? updatedMember.nickname : updatedMember.user.username : "Failed"}\`]`);
            await new Promise((resolve) => setTimeout(resolve, 1500));
        }

        return this;
    }
}