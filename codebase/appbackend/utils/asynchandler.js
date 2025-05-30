const asynchandler = (requsthadler) => {
   return (req, res, next) => {
        Promise.resolve(requsthadler(req, res, next)).
        catch((err) => next(err));
    }
}

export {asynchandler}