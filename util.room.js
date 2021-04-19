var utilRoom = {

    /** @param {string} roomName **/
    getEnergy: function(roomName) {
        return Game.rooms[roomName].energyAvailable
    },
    
    /** @param {string} roomName */
    getValidTiles: function(roomName) {
        var validTiles = []
        const terrain = new Room.Terrain(roomName)
        for(let y = 0; y < 50; y++) {
            for(let x = 0; x < 50; x++) {
                const tile = terrain.get(x, y);
                const weight =
                tile === TERRAIN_MASK_WALL  ? 255 : // wall  => unwalkable
                tile === TERRAIN_MASK_SWAMP ?   5 : // swamp => weight:  5
                                                1 ; // plain => weight:  1
                if (weight <= 1) {
                    validTiles.push([x,y])
                }
            }
        }
        return validTiles
    },
    
    /** @param {string} roomName */
    getValidTilesCloseTo: function(roomName, position, range) {
        var validTiles = []
        var validTilesCloseTo = []
        const terrain = new Room.Terrain(roomName)
        for(let y = 0; y < 50; y++ ) {
            for(let x = 0; x < 50; ) {
                const tile = terrain.get(x, y);
                const weight =
                tile === TERRAIN_MASK_WALL  ? 255 : // wall  => unwalkable
                tile === TERRAIN_MASK_SWAMP ?   5 : // swamp => weight:  5
                                                1 ; // plain => weight:  1
                                                
                var objAtPos = Game.rooms[roomName].lookAt(x, y)
                if (weight <= 1 && objAtPos.length <=1 ) { // Check for other structures as well
                    validTiles.push([x,y])
                }
                x = x + 2
            }
        }
        for (let index = 0; index < validTiles.length; index++) {
            const element = validTiles[index];
            if (position.inRangeTo(element[0], element[1], range)) {
                validTilesCloseTo.push(element)
            }
        }
        return validTilesCloseTo
    },

    /** @param {string} roomName */
    getStructuresInArea: function(roomName, position, range) {
        var retVal = []
        var structures = Game.rooms[roomName].find(FIND_STRUCTURES)
        for (let index = 0; index < structures.length; index++) {
            const element = structures[index];
            if (Math.abs(element.pos.x - position.x) <= range && Math.abs(element.pos.y - position.y) <= range) {
                retVal.push(element)
            }
        }
        return retVal
    },

    /** @param {string} roomName */
    getBrokenStructures: function(roomName) {
        var retVal = []
        var structures = Game.rooms[roomName].find(FIND_STRUCTURES)
        for (let index = 0; index < structures.length; index++) {
            const element = structures[index];
            if (element.hits < element.hitsMax) {
                retVal.push(element)
            }
        }
        return retVal
    },

    /** @param {string} roomName */
    hasConstructionSites: function(roomName) {
        val = false
        var constructionSites = Game.rooms[roomName].find(FIND_MY_CONSTRUCTION_SITES)
        if (constructionSites.length > 0) {
            val = true
        } else {
            val = false
        }
        return val
    },

    /** @param {string} roomName */
    findMinerals: function(roomName) {
        var val = []
        var mineralSites = Game.rooms[roomName].find(FIND_MINERALS)
        for (let index = 0; index < mineralSites.length; index++) {
            const element = mineralSites[index];
            if (element.mineralAmount > 0) {
                val.push(element)
            }
        }
        return val
    }
};

module.exports = utilRoom;