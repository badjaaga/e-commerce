module.exports = {
    getError(errors, property) {
        //propertyName === 'email'||'password'||passwordConfirmation
        try{
            return errors.mapped()[property].msg;
        }
        catch (err){
            return '';
        }
    }
}