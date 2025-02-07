class ExpressError extends Error{
    constructor(statucode, message){
        super();
        this.statucode = statucode;
        this.message = message;
    }
}

module.exports  = ExpressError;