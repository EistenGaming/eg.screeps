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