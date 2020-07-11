var roleMaintainer = {

    /** @param {Creep} creep **/
    run: function(creep) {
    // TODO: Implement

    if(creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
        creep.memory.building = false;
        creep.say('🔄 harvest');
    }
    if(!creep.memory.building && creep.store.getFreeCapacity() == 0) {
        creep.memory.building = true;
        creep.say('🚧 repair');
    }

    if(creep.memory.building) {

        var targets = []
        var structures = creep.room.find(FIND_STRUCTURES) // Why is FIND_MY_STRUCTURES not finding roads?
        for (let index = 0; index < structures.length; index++) {
            const element = structures[index];
            if (element.hits < element.hitsMax) {
                targets.push(element)
            }
        }

        if(targets.length) {
            if(creep.repair(targets[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
    }
    else {
        var sources = creep.room.find(FIND_SOURCES);
        if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
        }
    }

	}
};

module.exports = roleMaintainer;