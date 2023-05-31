export namespace procs {
	
	export class BaseProcess {
	    pID: number;
	    name: string;
	    displayName: string;
	    // Go type: time
	    startAt: any;
	    // Go type: time
	    endAt: any;
	    ended: boolean;
	
	    static createFrom(source: any = {}) {
	        return new BaseProcess(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.pID = source["pID"];
	        this.name = source["name"];
	        this.displayName = source["displayName"];
	        this.startAt = this.convertValues(source["startAt"], null);
	        this.endAt = this.convertValues(source["endAt"], null);
	        this.ended = source["ended"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace procsDal {
	
	export class TrackedProcess {
	    name: string;
	    displayName: string;
	    minutesOn: number;
	    updateAt: string;
	    stillRunning: boolean;
	
	    static createFrom(source: any = {}) {
	        return new TrackedProcess(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.displayName = source["displayName"];
	        this.minutesOn = source["minutesOn"];
	        this.updateAt = source["updateAt"];
	        this.stillRunning = source["stillRunning"];
	    }
	}

}

