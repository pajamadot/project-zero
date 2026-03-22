export interface EnemyDef {
  type: string;
  name: string;
  hp: number;
  atk: number;
  def: number;
  texture: string;
  xpReward: number;
}

export const ENEMIES: Record<string, EnemyDef> = {
  slime: {
    type: "slime",
    name: "Green Slime",
    hp: 8,
    atk: 4,
    def: 2,
    texture: "slime",
    xpReward: 5,
  },
  boss: {
    type: "boss",
    name: "Dark Slime King",
    hp: 50,
    atk: 8,
    def: 4,
    texture: "boss",
    xpReward: 100,
  },
};
