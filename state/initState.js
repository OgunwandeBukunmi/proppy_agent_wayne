export class AgentState {
    constructor(goal) {
        this.goal = goal;

        this.messages = [];

        this.pendingTasks = [];

        this.completedTasks = [];

        this.memory = {};

        this.toolHistory = [];

        this.currentAction = null;

        this.finished = false;
    }
}