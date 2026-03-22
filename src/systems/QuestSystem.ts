export enum QuestState {
  INACTIVE = "inactive",
  ACTIVE = "active",
  COMPLETE = "complete",
}

export class QuestSystem {
  private quests: Map<string, QuestState> = new Map();

  getState(id: string): QuestState {
    return this.quests.get(id) ?? QuestState.INACTIVE;
  }

  activate(id: string) {
    this.quests.set(id, QuestState.ACTIVE);
  }

  complete(id: string) {
    this.quests.set(id, QuestState.COMPLETE);
  }

  isComplete(id: string): boolean {
    return this.quests.get(id) === QuestState.COMPLETE;
  }
}
