import { Translate } from "tools";
import { SimpleDrawDocument } from "document";

class Context {
     private input : Array<string>;
     private i : number = 0; 

     constructor(cmd: string, private doc: SimpleDrawDocument) {
        this.input = cmd.split(' ');
     }

    hasNext(): boolean {
        return this.i < this.input.length
    }

    getToken(): string {
        let token = this.input[this.i]
        this.i++;
        return token;
    }

    getDoc(): SimpleDrawDocument {
        return this.doc;
    }
 }

 interface Expression {
    interpret(context: Context) : boolean;
 }

 class TerminalExpression implements Expression {
     
     protected capture: string;
     constructor(private regExp: RegExp){}

     interpret(context: Context): boolean {
         return context.hasNext() && this.regExp.test(this.capture = context.getToken());
     }   
 }
 
 class TerminalExpressionNumber extends TerminalExpression {
    constructor(float: boolean){
        if (float) super(new RegExp('^[0-9]+(\.[0-9]+)?$'));
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
        return (context.getDoc().createRectangle(params[0], params[1], params[2], params[3], params[4]) !== null);
     }
 }

 class CircleExp implements Expression {
     interpret(context: Context): boolean {
        let args: Array<Expression> = [new TerminalExpression(new RegExp('^circle$')), new TerminalExpressionNumber(true), 
            new TerminalExpressionNumber(true), new TerminalExpressionNumber(false)];
        for (const exp of args)
            if (!exp.interpret(context)) return false;
        let params: Array<number> = new Array<number>();
        for (let i = 1; i < args.length; i++)
            params.push((args[i] as TerminalExpressionNumber).getValue());
        return (context.getDoc().createCircle(params[0], params[1], params[2], params[3]) !== null);
     }    
}

 class CreateExp implements Expression {
    interpret(context: Context): boolean {
        let and: Array<Expression> = [new TerminalExpression(new RegExp("^create$"))];
        let or: Array<Expression> = [new RectangleExp(), new CircleExp()];
        let ret : boolean = true;
        for (const exp of and)
            if (!exp.interpret(context)) return false;
        for (const exp of or)
            if (exp.interpret(context)) return true;
        return false;
    }
     
 }

 class RotateExp implements Expression {
    interpret(context: Context): boolean {
         throw new Error("Method not implemented.");
    }
     
 }

 class TranslateExp implements Expression {
    interpret(context: Context): boolean {
         throw new Error("Method not implemented.");
    }
     
 }

 class Command implements Expression {
     interpret(context: Context): boolean {
         let or: Array<Expression> = [new CreateExp(), new RotateExp(), new TranslateExp()];
         for (const exp of or) {
             if (exp.interpret(context)) return true;
         }
         return false;
     }
     
 }

export class Repl {

     constructor(private doc: SimpleDrawDocument) {} 

     public intepretCommand(cmd: string) : void{
        let ctx: Context = new Context(cmd, this.doc);
        new Command().interpret(ctx);
     }
 }