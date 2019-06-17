import { Action } from "actions";

//type UndoableAction<S> = { do(): S; undo(): void }

export class UndoManager<S, A extends Action<S>> {
  doStack = new Array<A>();
  undoStack = new Array<A>();

  undo(): void {
    if (this.doStack.length > 0) {
      const a1 = this.doStack.pop();
      a1.undo();
      this.undoStack.push(a1);
    }
  }

  redo(): void {
    if (this.undoStack.length > 0) {
      const a1 = this.undoStack.pop();
      a1.do();
      this.doStack.push(a1);
    }
  }

  onActionDone(a: A): void {
    this.doStack.push(a);
    this.undoStack.length = 0;
  }
}
