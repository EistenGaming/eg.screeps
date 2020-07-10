var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var utilRoom = require('util.room');
var util = require('util');
var spawnTickDelay = 50
var structureCheckTickDelay = 50
var infoTickDelay = 20
var infoTimestamp = 0
var spawnTimestamp = 0
var structureTimestamp = 0
var targetExtensionCount = 5
var spawnToSourceRoads = true
var spawnToExtensionRoads = true
var spawnToControlRoads = true
var sourcesToControl = true

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

        for(var roomName in Game.rooms) {
            var currentEnergy = utilRoom.getEnergy(roomName)

            /** Autospawner */
            var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
            var upgraders  = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
            var builders  = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
        
            if(harvesters.length < 4 && currentEnergy >= 200) {
                var newName = 'Harvester' + Game.time;
                console.log('• Spawning new harvester: ' + newName);
                Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName, 
                    {memory: {role: 'harvester'}});
            }
        
            if(upgraders.length < 3 && currentEnergy >= 200) {
                var newName = 'Upgrader' + Game.time;
                console.log('• Spawning new upgrader: ' + newName);
                Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName, 
                    {memory: {role: 'upgrader'}});
            }
        
            if(builders.length < 5 && currentEnergy >= 200 && utilRoom.hasConstructionSites(roomName) == true) {
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
            
            /** Extensions */
            var validTiles = utilRoom.getValidTiles(roomName)
            var extensions = _.filter(Game.structures, (structure) => structure.structureType == 'extension'); /** TODO: Check if this is per room? Attention: Construction sites of type 'extension' != extensions!*/
            if (extensions.length < targetExtensionCount) {
                console.log('• [' + roomName + '] Building extension: '+extensions.length+' of ['+targetExtensionCount+']')
                for (let index = 0; index < targetExtensionCount; index++) {
                    Game.rooms[roomName].createConstructionSite(validTiles[index][0], validTiles[index][1], 'extension', 'Ext' + index)    
                }
            } else {
                console.log('• [' + roomName + '] No extensions to build')
            }
            
            /** Roads: Spawn->Sources */
            if (spawnToSourceRoads == true) {
                var sources = Game.spawns['Spawn1'].room.find(FIND_SOURCES);
                var startPos = Game.spawns['Spawn1'].pos

                for (let index = 0; index < sources.length; index++) {
                    var targetPos = sources[index].pos 
                    console.log('• [' + roomName + '] Building road from: '+startPos.x+'.'+startPos.y+' to '+targetPos.x+'.'+targetPos.y)
                    const path = Game.spawns['Spawn1'].room.findPath(startPos, targetPos)
                    for (let index = 0; index < path.length; index++) {
                        const element = path[index];
                        Game.rooms[roomName].createConstructionSite(element.x, element.y, 'road', 'Rd' + index)
                    }                    
                }
                spawnToSourceRoads = false
            }

            /** Roads: Spawn->Extensions */
            if (spawnToExtensionRoads == true) {
                
                var extensions = Game.spawns['Spawn1'].room.find(FIND_STRUCTURES, {
                    filter: (structure) => { return (structure.structureType == STRUCTURE_EXTENSION)  }
                })
                
                var startPos = Game.spawns['Spawn1'].pos

                for (let index = 0; index < extensions.length; index++) {
                    var targetPos = extensions[index].pos 
                    console.log('• [' + roomName + '] Building road from: '+startPos.x+'.'+startPos.y+' to '+targetPos.x+'.'+targetPos.y)
                    const path = Game.spawns['Spawn1'].room.findPath(startPos, targetPos)
                    for (let index = 0; index < path.length; index++) {
                        const element = path[index];
                        Game.rooms[roomName].createConstructionSite(element.x, element.y, 'road', 'Rd' + index)
                    }                    
                }
                spawnToExtensionRoads = false
            }

            /** Roads: Spawn->Control */
            if (spawnToControlRoads == true) {
                var startPos  = Game.spawns['Spawn1'].pos
                var targetPos =  Game.rooms[roomName].controller.pos
                console.log('• [' + roomName + '] Building road from: '+startPos.x+'.'+startPos.y+' to '+targetPos.x+'.'+targetPos.y)
                const path = Game.spawns['Spawn1'].room.findPath(startPos, targetPos)
                for (let index = 0; index < path.length; index++) {
                    const element = path[index];
                    Game.rooms[roomName].createConstructionSite(element.x, element.y, 'road', 'Rd' + index)
                }                    
                spawnToControlRoads = false
            }

        }

        /** if there are construction sites in the room, create builders. Dont if there aren't any */

        console.log('-------------------------------------------------')
        structureTimestamp = Game.time
    }

    /** Game info */
    if (Game.time > infoTimestamp + infoTickDelay) {

        for(var roomName in Game.rooms) {
            console.log(' ')
            console.log('GAME INFO ['+roomName+']')
            var currentEnergy = utilRoom.getEnergy(roomName)
            console.log('• Room ' + roomName + ' has ' + currentEnergy + ' energy available.');
            console.log('• Room ' + roomName + ' Construction work to do: ' + utilRoom.hasConstructionSites(roomName))

            console.log('• Room ' + roomName + ' Roads: Spawn->Sources     : ' + util.boolToDone(spawnToSourceRoads))
            console.log('• Room ' + roomName + ' Roads: Spawn->Extensions  : ' + util.boolToDone(spawnToExtensionRoads))
            console.log('• Room ' + roomName + ' Roads: Spawn->Control     : ' + util.boolToDone(spawnToControlRoads))
            console.log('-------------------------------------------------')
            infoTimestamp = Game.time
        }
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