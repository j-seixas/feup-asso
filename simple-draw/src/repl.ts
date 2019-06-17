import { Translate, Rotate } from "./tools";
import { SimpleDrawDocument } from "document";
import { ViewController, CanvasFactory, SVGFactory } from "./view";

class Context {
    private input: Array<string>;
    private i: number = 0;

    constructor(cmd: string, private doc: SimpleDrawDocument, private view: ViewController) {
        this.input = cmd.split(' ');
    }

    hasNext(): boolean {
        return this.i < this.input.length
    }

    getToken(): string {
        return this.input[this.i];
    }

    next(): boolean {
        this.i++;
        return true;
    }

    getDoc(): SimpleDrawDocument {
        return this.doc;
    }

    getView(): ViewController {
        return this.view;
    }
}

interface Expression {
    interpret(context: Context): boolean;
}

class TerminalExpression implements Expression {

    protected capture: string;
    constructor(private regExp: RegExp) { }

    interpret(context: Context): boolean {
        return context.hasNext() && this.regExp.test(this.capture = context.getToken()) && context.next();
    }

}

class TerminalExpressionNumber extends TerminalExpression {
    constructor(float: boolean) {
        if (float) super(new RegExp('^-?[0-9]+(\.[0-9]+)?$'));
        else super(new RegExp('^[0-9]+$'));
    }

    public getValue(): number {
        return Number(this.capture);
    }
}

class RectangleExp implements Expression {
    interpret(context: Context): boolean {
        let args: Array<Expression> = [new TerminalExpression(new RegExp('^rectangle$')), new TerminalExpressionNumber(true),
        new TerminalExpressionNumber(true), new TerminalExpressionNumber(true), new TerminalExpressionNumber(true), new TerminalExpressionNumber(false)];
        for (const exp of args)
            if (!exp.interpret(context)) return false;
        let params: Array<number> = new Array<number>();
        for (let i = 1; i < args.length; i++)
            params.push((args[i] as TerminalExpressionNumber).getValue());
        try {
            return context.getDoc().createRectangle(params[0], params[1], params[2], params[3], params[4]) !== null;
        } catch (e) {
            return false;
        }
    }
}

class CircleExp implements Expression {
    interpret(context: Context): boolean {
        let args: Array<Expression> = [new TerminalExpression(new RegExp('^circle$')), new TerminalExpressionNumber(true),
        new TerminalExpressionNumber(true), new TerminalExpressionNumber(true), new TerminalExpressionNumber(false)];
        for (const exp of args)
            if (!exp.interpret(context)) return false;
        let params: Array<number> = new Array<number>();
        for (let i = 1; i < args.length; i++)
            params.push((args[i] as TerminalExpressionNumber).getValue());
        try {
            return (context.getDoc().createCircle(params[0], params[1], params[2], params[3]) !== null);
        } catch (e) {
            return false;
        }
    }
}

class CreateExp implements Expression {
    interpret(context: Context): boolean {
        let and: Array<Expression> = [new TerminalExpression(new RegExp("^create$"))];
        let or: Array<Expression> = [new RectangleExp(), new CircleExp()];
        for (const exp of and)
            if (!exp.interpret(context)) return false;
        for (const exp of or)
            if (exp.interpret(context)) return true;
        return false;
    }

}

class RotateExp implements Expression {
    interpret(context: Context): boolean {
        let and: Array<Expression> = [new TerminalExpression(new RegExp("^rotate$")),
        new TerminalExpression(new RegExp("^selection$")), new TerminalExpressionNumber(true)];
        for (const exp of and)
            if (!exp.interpret(context)) return false;
        try {
            return Rotate.rotateSelection(context.getDoc(), (and[2] as TerminalExpressionNumber).getValue());
        } catch (e) {
            return false;
        }
    }

}

class ZoomExp implements Expression {
    interpret(context: Context): boolean {
        let and: Array<Expression> = [new TerminalExpression(new RegExp("^zoom$")),
        new TerminalExpressionNumber(false), new TerminalExpressionNumber(true)];
        for (const exp of and)
            if (!exp.interpret(context)) return false;
        let params: Array<number> = new Array<number>();
        for (let i = 1; i < and.length; i++)
            params.push((and[i] as TerminalExpressionNumber).getValue());
        try {
            context.getView().renders[params[0] - 1].increaseZoom(params[1]);
            return true;
        } catch (e) {
            return false;
        }
    }
}

class TranslateSelectionExp implements Expression {
    interpret(context: Context): boolean {
        let and: Array<Expression> = [new TerminalExpression(new RegExp("^selection$")),
        new TerminalExpressionNumber(true), new TerminalExpressionNumber(true)];
        for (const exp of and)
            if (!exp.interpret(context)) return false;
        let params: Array<number> = new Array<number>();
        for (let i = 1; i < and.length; i++)
            params.push((and[i] as TerminalExpressionNumber).getValue());
        try {
            return Translate.setPositionSelection(context.getDoc(), params[0], params[1]);
        } catch (e) {
            return false;
        }
    }
}


class TranslateViewportExp implements Expression {
    interpret(context: Context): boolean {
        let and: Array<Expression> = [new TerminalExpressionNumber(false),
        new TerminalExpressionNumber(true), new TerminalExpressionNumber(true)];
        for (const exp of and)
            if (!exp.interpret(context)) return false;
        let params: Array<number> = new Array<number>();
        for (let i = 0; i < and.length; i++)
            params.push((and[i] as TerminalExpressionNumber).getValue());
        try {
            context.getView().renders[params[0] - 1].setX(params[1]);
            context.getView().renders[params[0] - 1].setX(params[2]);
            return true;
        } catch (e) {
            return false;
        }
    }
}

class TranslateExp implements Expression {
    interpret(context: Context): boolean {
        let and: Array<Expression> = [new TerminalExpression(new RegExp("^translate$"))];
        let or: Array<Expression> = [new TranslateSelectionExp(), new TranslateViewportExp()];
        for (const exp of and)
            if (!exp.interpret(context)) return false;
        for (const exp of or)
            if (exp.interpret(context)) return true;
        return false;
    }
}

class UndoExp implements Expression {
    interpret(context: Context): boolean {
        let and: Array<Expression> = [new TerminalExpression(new RegExp("^undo$"))];
        for (const exp of and)
            if (!exp.interpret(context)) return false;
        try {
            context.getDoc().undo();
            return true;
        } catch (e) {
            return false;
        }
    }
}

class RedoExp implements Expression {
    interpret(context: Context): boolean {
        let and: Array<Expression> = [new TerminalExpression(new RegExp("^redo$"))];
        for (const exp of and)
            if (!exp.interpret(context)) return false;
        try {
            context.getDoc().redo();
            return true;
        } catch (e) {
            return false;
        }
    }
}

class CreateCanvasExp implements Expression {
    interpret(context: Context): boolean {
        let and: Array<Expression> = [new TerminalExpression(new RegExp("^canvas$"))];
        for (const exp of and)
            if (!exp.interpret(context)) return false;
        try {
            context.getView().addRender(new CanvasFactory())
            return true;
        } catch (e) {
            return false;
        }
    }
}

class CreateSVGExp implements Expression {
    interpret(context: Context): boolean {
        let and: Array<Expression> = [new TerminalExpression(new RegExp("^svg$"))];
        for (const exp of and)
            if (!exp.interpret(context)) return false;
        try {
            context.getView().addRender(new SVGFactory());
            return true;
        } catch (e) {
            return false;
        }
    }
}

class CreateViewportExp implements Expression {
    interpret(context: Context): boolean {
        let and: Array<Expression> = [new TerminalExpression(new RegExp("^viewport$"))];
        let or: Array<Expression> = [new CreateCanvasExp(), new CreateSVGExp()];
        for (const exp of and)
            if (!exp.interpret(context)) return false;
        for (const exp of or)
            if (exp.interpret(context)) return true;
        return false;
    }
}


class Command implements Expression {
    interpret(context: Context): boolean {
        let or: Array<Expression> = [new CreateExp(), new RotateExp(), new TranslateExp(),
        new UndoExp(), new RedoExp(), new ZoomExp(), new CreateViewportExp()];
        for (const exp of or) {
            if (exp.interpret(context)) return true;
        }
        return false;
    }
}

export class Repl {

    constructor(private doc: SimpleDrawDocument, private view: ViewController) { }

    public intepretCommand(cmd: string): boolean {
        let ctx: Context = new Context(cmd, this.doc, this.view);
        return new Command().interpret(ctx);
    }
}