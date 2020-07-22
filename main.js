var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleMaintainer = require('role.maintainer');
var roleMiner = require('role.miner');
var utilRoom = require('util.room');
var util = require('util');

var spawnTickDelay = 50
var structureCheckTickDelay = 50
var infoTickDelay = 20
var infoTimestamp = 0
var spawnTimestamp = 0
var structureTimestamp = 0
var targetExtensionCount = 0
var noOfHarvestersPerRoom = 2
var noOfBuildersPerRoom = 2
var noOfUpgradersPerRoom = 2
var noOfMaintainersPerRoom = 2
var noOfMinersPerRoom = 2
var roomResourceType = ''

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
            var maintainers  = _.filter(Game.creeps, (creep) => creep.memory.role == 'maintainer');
            var miners = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner');
        
            var controllerLevel = Game.spawns['Spawn1'].room.controller.level

            if(harvesters.length < noOfHarvestersPerRoom ) {
                var bodySetup = []
                if (currentEnergy >= 400) {
                    bodySetup = [WORK,WORK,CARRY,CARRY,MOVE,MOVE]
                }
                else if (currentEnergy >= 300) {
                    bodySetup = [WORK,CARRY,CARRY,MOVE,MOVE]
                } else {
                    bodySetup = [WORK,CARRY,MOVE]
                }
                var newName = 'Harvester' + Game.time;
                console.log('• Spawning new harvester: ' + newName);
                Game.spawns['Spawn1'].spawnCreep(bodySetup, newName, 
                    {memory: {role: 'harvester'}});
            }
        
            if(upgraders.length < noOfUpgradersPerRoom && harvesters.length >= noOfHarvestersPerRoom/2) {
                var bodySetup = []
                if (currentEnergy >= 400) {
                    bodySetup = [WORK,WORK,CARRY,CARRY,MOVE,MOVE]
                }
                else if (currentEnergy >= 300) {
                    bodySetup = [WORK,CARRY,CARRY,MOVE,MOVE]
                } else {
                    bodySetup = [WORK,CARRY,MOVE]
                }
                var newName = 'Upgrader' + Game.time;
                console.log('• Spawning new upgrader: ' + newName);
                Game.spawns['Spawn1'].spawnCreep(bodySetup, newName, 
                    {memory: {role: 'upgrader'}});
            }
        
            if(builders.length < noOfBuildersPerRoom && utilRoom.hasConstructionSites(roomName) == true && harvesters.length >= noOfHarvestersPerRoom/2) {
                var bodySetup = []
                if (currentEnergy >= 400) {
                    bodySetup = [WORK,WORK,WORK,CARRY,MOVE]
                }
                else if (currentEnergy >= 300) {
                    bodySetup = [WORK,WORK,CARRY,MOVE]
                } else {
                    bodySetup = [WORK,CARRY,MOVE]
                }
                var newName = 'Builder' + Game.time;
                console.log('• Spawning new builder: ' + newName);
                Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName, 
                    {memory: {role: 'builder'}});
            }

            if(maintainers.length < noOfMaintainersPerRoom && upgraders.length == noOfUpgradersPerRoom && !utilRoom.hasConstructionSites(roomName) ) { // TODO: WHEN to spawn them should depend on broken structures
                var bodySetup = []
                if (currentEnergy >= 400) {
                    bodySetup = [WORK,WORK,CARRY,CARRY,MOVE,MOVE]
                }
                else if (currentEnergy >= 300) {
                    bodySetup = [WORK,CARRY,CARRY,MOVE,MOVE]
                } else {
                    bodySetup = [WORK,CARRY,MOVE]
                }
                var newName = 'Maintainer' + Game.time;
                console.log('• Spawning new maintainer: ' + newName);
                Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName, 
                    {memory: {role: 'maintainer'}});
            }

            if(miners.length < noOfMinersPerRoom && controllerLevel >= 4 && !utilRoom.hasConstructionSites(roomName)) { // Only spawn them when the extractor is finished (no construction sites are left)
                var bodySetup = []
                if (currentEnergy >= 400) {
                    bodySetup = [WORK,WORK,CARRY,CARRY,MOVE,MOVE]
                }
                else if (currentEnergy >= 300) {
                    bodySetup = [WORK,CARRY,CARRY,MOVE,MOVE]
                } else {
                    bodySetup = [WORK,CARRY,MOVE]
                }
                var newName = 'Miner' + Game.time;
                console.log('• Spawning new miner: ' + newName);
                Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName, 
                    {memory: {role: 'miner'}});
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
        var totalActiveCreeps = harvesters.length + upgraders.length + builders.length + maintainers.length
        console.log('• Total active creeps: ' + totalActiveCreeps)
        console.log('• Harvesters: ' + harvesters.length + ' | Upgraders: ' + upgraders.length+ ' | Builders: ' + builders.length + ' | Maintainers: ' + maintainers.length + ' | Miners: ' + miners.length);
        console.log('-------------------------------------------------')
        spawnTimestamp = Game.time
    }

    /** Structure building Logic */
    if (Game.time > structureTimestamp + structureCheckTickDelay) {
        console.log(' ')
        console.log('TICK: Structure')
        for(var roomName in Game.rooms) {
            
            /** Extensions */
            /** Set targetExtensionCount based on controller level */
            var controllerLevel = Game.spawns['Spawn1'].room.controller.level
            switch (controllerLevel) {
                case 2:
                    targetExtensionCount = 5

                    noOfHarvestersPerRoom = 4
                    noOfBuildersPerRoom = 3
                    noOfUpgradersPerRoom = 4
                    noOfMaintainersPerRoom = 0
                    noOfMinersPerRoom = 0
                    break;
                case 3:
                    targetExtensionCount = 10

                    noOfHarvestersPerRoom = 6
                    noOfBuildersPerRoom = 5
                    noOfUpgradersPerRoom = 6
                    noOfMaintainersPerRoom = 0
                    noOfMinersPerRoom = 0
                    break;
                case 4:
                    targetExtensionCount = 20

                    noOfHarvestersPerRoom = 10
                    noOfBuildersPerRoom = 7
                    noOfUpgradersPerRoom = 8
                    noOfMaintainersPerRoom = 0
                    noOfMinersPerRoom = 2
                    break;
                case 5:
                    targetExtensionCount = 30

                    noOfHarvestersPerRoom = 15
                    noOfBuildersPerRoom = 8
                    noOfUpgradersPerRoom = 10
                    noOfMaintainersPerRoom = 0
                    noOfMinersPerRoom = 4
                    break;
                case 6:
                    targetExtensionCount = 40

                    noOfHarvestersPerRoom = 15
                    noOfBuildersPerRoom = 10
                    noOfUpgradersPerRoom = 20
                    noOfMaintainersPerRoom = 0
                    noOfMinersPerRoom = 4
                    break;
                case 7:
                    targetExtensionCount = 50

                    noOfHarvestersPerRoom = 15
                    noOfBuildersPerRoom = 10
                    noOfUpgradersPerRoom = 30
                    noOfMaintainersPerRoom = 0
                    noOfMinersPerRoom = 4
                    break;
                case 8:
                    targetExtensionCount = 60

                    noOfHarvestersPerRoom = 15
                    noOfBuildersPerRoom = 15
                    noOfUpgradersPerRoom = 5
                    noOfMaintainersPerRoom = 0
                    noOfMinersPerRoom = 4
                    break;
                default:
                    break;
            }

            var validTiles = utilRoom.getValidTilesCloseTo(roomName, Game.spawns['Spawn1'].pos, 10)
            console.log('valid tiles #: ' +validTiles.length)
            var extensions = _.filter(Game.structures, (structure) => structure.structureType == 'extension'); /** TODO: Check if this is per room? Attention: Construction sites of type 'extension' != extensions!*/
            if (extensions.length < targetExtensionCount) {
                console.log('• [' + roomName + '] Building extension: '+extensions.length+' of ['+targetExtensionCount+']')
                for (let index = 0; index < targetExtensionCount;index++) {
                    Game.rooms[roomName].createConstructionSite(validTiles[index][0], validTiles[index][1], 'extension', 'Ext' + index)
                }
            } else {
                console.log('• [' + roomName + '] No extensions to build')
            }
            
            /** Roads: Spawn->Sources */
            // if (spawnToSourceRoads == true) {
            //     var sources = Game.spawns['Spawn1'].room.find(FIND_SOURCES);
            //     var startPos = Game.spawns['Spawn1'].pos

            //     for (let index = 0; index < sources.length; index++) {
            //         var targetPos = sources[index].pos 
            //         console.log('• [' + roomName + '] Building road from: '+startPos.x+'.'+startPos.y+' to '+targetPos.x+'.'+targetPos.y)
            //         const path = Game.spawns['Spawn1'].room.findPath(startPos, targetPos)
            //         for (let index = 0; index < path.length; index++) {
            //             const element = path[index];
            //             Game.rooms[roomName].createConstructionSite(element.x, element.y, 'road', 'Rd' + index)
            //         }                    
            //     }
            // }

            /** Roads: Spawn->Extensions */
            // if (spawnToExtensionRoads == true) {
                
            //     var extensions = Game.spawns['Spawn1'].room.find(FIND_STRUCTURES, {
            //         filter: (structure) => { return (structure.structureType == STRUCTURE_EXTENSION)  }
            //     })
                
            //     var startPos = Game.spawns['Spawn1'].pos

            //     for (let index = 0; index < extensions.length; index++) {
            //         var targetPos = extensions[index].pos 
            //         console.log('• [' + roomName + '] Building road from: '+startPos.x+'.'+startPos.y+' to '+targetPos.x+'.'+targetPos.y)
            //         const path = Game.spawns['Spawn1'].room.findPath(startPos, targetPos)
            //         for (let index = 0; index < path.length; index++) {
            //             const element = path[index];
            //             Game.rooms[roomName].createConstructionSite(element.x, element.y, 'road', 'Rd' + index)
            //         }                    
            //     }
            // }

            /** Roads: Spawn->Control */
            // if (spawnToControlRoads == true) {
            //     var startPos  = Game.spawns['Spawn1'].pos
            //     var targetPos =  Game.rooms[roomName].controller.pos
            //     console.log('• [' + roomName + '] Building road from: '+startPos.x+'.'+startPos.y+' to '+targetPos.x+'.'+targetPos.y)
            //     const path = Game.spawns['Spawn1'].room.findPath(startPos, targetPos)
            //     for (let index = 0; index < path.length; index++) {
            //         const element = path[index];
            //         Game.rooms[roomName].createConstructionSite(element.x, element.y, 'road', 'Rd' + index)
            //     }                    
            // }
            
            /** Tower 1 */
            if (controllerLevel >= 3) {
                console.log('• [' + roomName + '] Building tower 1.')
                var validTiles = utilRoom.getValidTilesCloseTo(roomName, Game.spawns['Spawn1'].pos, 6)
                Game.rooms[roomName].createConstructionSite(validTiles[0][0], validTiles[0][1], 'tower', 'tower1')
            }
            
            /** Storage - Stores huge amounts of resources (one per room) */
            if (controllerLevel >= 4) {
                console.log('• [' + roomName + '] Building storage.')
                var validTiles = utilRoom.getValidTilesCloseTo(roomName, Game.spawns['Spawn1'].pos, 6)
                Game.rooms[roomName].createConstructionSite(validTiles[0][0], validTiles[0][1], 'storage', 'Storage')
            }

            /** Tower 1 */
            if (controllerLevel >= 5) {
                console.log('• [' + roomName + '] Building tower 2.')
                var validTiles = utilRoom.getValidTilesCloseTo(roomName, Game.spawns['Spawn1'].pos,6)
                Game.rooms[roomName].createConstructionSite(validTiles[0][0], validTiles[0][1], 'tower', 'tower2')
            }
            
            /** Mineral Sites - Valid at controller level 6 or higher */
            if (controllerLevel >= 6) {
                var mineralSites = utilRoom.findMinerals(roomName)
                console.log('• [' + roomName + '] has ' + mineralSites.length + ' mineral sites present.' )
                console.log('• [' + roomName + '] Building mineral extractor of type [' + mineralSites[0].mineralType + ']')
                roomResourceType = mineralSites[0].mineralType
                Game.rooms[roomName].createConstructionSite(mineralSites[0].pos.x, mineralSites[0].pos.y, 'extractor', 'Extractor'+mineralSites[0].mineralType)
            }
            

            /** Labs - produces mineral compounds, boosts and unboosts creeps */

            /** Terminal - send resources from one room to another one */

            /** Links - Transfers energy from point to point in one room*/

            

            /** Walls / Ramparts */
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
            console.log('• Room ' + roomName + ' Construction work to do   : ' + utilRoom.hasConstructionSites(roomName))

            console.log('-------------------------------------------------')
            infoTimestamp = Game.time
        }
    }

    /** Tower Control */
    for(var roomName in Game.rooms) {
        var controllerLevel = Game.rooms[roomName].controller.level
        if (controllerLevel >= 3) {
            /** Defense */
            var hostiles = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS);
            if(hostiles.length > 0) {
                var username = hostiles[0].owner.username;
                Game.notify(`User ${username} spotted in room ${roomName}`);
                var towers = Game.rooms[roomName].find(
                    FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
                towers.forEach(tower => tower.attack(hostiles[0]));
            }
            /** Repair */
            var structures =  Game.rooms[roomName].find(FIND_STRUCTURES) // Why is FIND_MY_STRUCTURES not finding roads?
            for (let index = 0; index < structures.length; index++) {
                const element = structures[index];
                if (element.hits < element.hitsMax) {
                    Game.notify('• Room ' + roomName + ' reapairing structure.');
                    var towers = Game.rooms[roomName].find(
                        FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
                    towers.forEach(tower => tower.repair(element))
                }
            }
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
        if(creep.memory.role == 'maintainer') {
            roleMaintainer.run(creep);
        }
        if(creep.memory.role == 'miner') {
            roleMiner.run(creep, roomResourceType);
        }
    }
}