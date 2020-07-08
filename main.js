var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var utilRoom = require('util.room');
var spawnTickDelay = 50
var structureCheckTickDelay = 50
var spawnTimestamp = 0
var structureTimestamp = 0
var targetExtensionCount = 5

module.exports.loop = function () {

    /** Memory housekeeping */
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    /** Spawning logic, per room */
    /** The spawning logic is delayed by spawnTickDelay */
    if (Game.time > spawnTimestamp + spawnTickDelay) {
        console.log(' ')
        console.log('TICK: Spawner')

        for(var name in Game.rooms) {
            var currentEnergy = utilRoom.getEnergy(name)
            console.log('• Room "' + name + '" has ' + currentEnergy + ' energy available.');    

            /** Autospawner */
            var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
            var upgraders  = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
            var builders  = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
        
            if(harvesters.length < 2 && currentEnergy >= 200) {
                var newName = 'Harvester' + Game.time;
                console.log('• Spawning new harvester: ' + newName);
                Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName, 
                    {memory: {role: 'harvester'}});
            }
        
            if(upgraders.length < 2 && currentEnergy >= 200) {
                var newName = 'Upgrader' + Game.time;
                console.log('• Spawning new upgrader: ' + newName);
                Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName, 
                    {memory: {role: 'upgrader'}});
            }
        
            if(builders.length < 5 && currentEnergy >= 200) {
                var newName = 'Builder' + Game.time;
                console.log('• Spawning new builder: ' + newName);
                Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName, 
                    {memory: {role: 'builder'}});
            }

        }

            /** Spawning notifications */
        if(Game.spawns['Spawn1'].spawning) { 
            var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
            Game.spawns['Spawn1'].room.visual.text(
                '🛠️' + spawningCreep.memory.role,
                Game.spawns['Spawn1'].pos.x + 1, 
                Game.spawns['Spawn1'].pos.y, 
                {align: 'left', opacity: 0.8});
        }

        console.log('• Harvesters: ' + harvesters.length + ' | Upgraders: ' + upgraders.length+ ' | Builders: ' + builders.length);
        console.log('-------------------------------------------------')
        spawnTimestamp = Game.time
    }

    /** Structure building Logic */
    if (Game.time > structureTimestamp + structureCheckTickDelay) {
        console.log(' ')
        console.log('TICK: Structure')
        for(var roomName in Game.rooms) {

            var validTiles = utilRoom.getValidTiles(roomName)
            var extensions = _.filter(Game.structures, (structure) => structure.structureType == 'extension'); /** TODO: Check if this is per room? Attention: Construction sites of type 'extension' != extensions!*/
            if (extensions.length < targetExtensionCount) {
                console.log('• [' + roomName + '] Building extension: '+extensions.length+' of ['+targetExtensionCount+']')
                for (let index = 0; index < targetExtensionCount; index++) {
                    Game.rooms[roomName].createConstructionSite(validTiles[index][0], validTiles[index][1], 'extension', 'Ext' + index)    
                }
            } else {
                console.log('• [' + roomName + '] Nothing to build')
            }
        }
        console.log('-------------------------------------------------')
        structureTimestamp = Game.time
    }


    /** Role assignment & run*/
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
    }
}