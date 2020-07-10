var util = {

    /** @param {bool} value **/
    boolToDone: function(value) {

        const retVal =
        value === false  ? 'Done' : 
                           'Not Done';
        return retVal
    }
    
};

module.exports = util;