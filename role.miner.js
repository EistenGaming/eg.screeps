var roleMiner = {

    /** @param {Creep} creep **/
    run: function(creep, resourceType) {
	    if(creep.store.getFreeCapacity() > 0) {
            var sources = creep.room.find(FIND_MINERALS);
            if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
        else {
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_STORAGE) &&
                            structure.store.getFreeCapacity(resourceType) > 0;
                    }
            });
            if(targets.length > 0) {
                if(creep.transfer(targets[0], resourceType) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
	}
};

module.exports = roleMiner;