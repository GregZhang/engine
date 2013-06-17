pc.extend(pc.fw, function () {
    /**
     * @name pc.fw.BallSocketJointComponentSystem
     * @constructor Create a new BallSocketJointComponentSystem
     * @class Manages creation of BallSocketJointComponents
     * @param {pc.fw.ApplicationContext} context The ApplicationContext for the running application
     * @extends pc.fw.ComponentSystem
     */
    var BallSocketJointComponentSystem = function BallSocketJointComponentSystem(context) {
        this.id = "ballsocketjoint";
        context.systems.add(this.id, this);

        this.ComponentType = pc.fw.BallSocketJointComponent;
        this.DataType = pc.fw.BallSocketJointComponentData;

        this.schema = [{
            name: "pivot",
            displayName: "Pivot",
            description: "Local space pivot",
            type: "vector",
            options: {
                min: 0,
                step: 0.1
            },
            defaultValue: [0, 0, 0]
        }, {
            name: "position",
            displayName: "Position",
            description: "World space joint position",
            type: "vector",
            options: {
                min: 0,
                step: 0.1
            },
            defaultValue: [0, 0, 0]
        }, {
            name: "tau",
            displayName: "Tau",
            description: "TBD",
            type: "number",
            defaultValue: 0.001,
            options: {
                min: 0,
                max: 1
            }            
        }, {
            name: "damping",
            displayName: "Damping",
            description: "Damping",
            type: "number",
            defaultValue: 1,
            options: {
                min: 0,
                max: 1
            }            
        }, {
            name: "impulseClamp",
            displayName: "Impulse Clamp",
            description: "Impulse Clamp",
            type: "number",
            defaultValue: 0,
            options: {
                min: 0,
                max: 100
            }            
        }, {
            name: "constraint",
            exposed: false
        }];

        this.exposeProperties();

        this.debugRender = false;

        this.on('remove', this.onRemove, this);

        pc.fw.ComponentSystem.on('update', this.onUpdate, this);
        pc.fw.ComponentSystem.on('toolsUpdate', this.onToolsUpdate, this);
    };
    BallSocketJointComponentSystem = pc.inherits(BallSocketJointComponentSystem, pc.fw.ComponentSystem);
    
    BallSocketJointComponentSystem.prototype = pc.extend(BallSocketJointComponentSystem.prototype, {
        initializeComponentData: function (component, data, properties) {
            if (typeof(Ammo) !== 'undefined') {
                if (component.entity.rigidbody) {
                    var pivotA = new Ammo.btVector3(data.pivot[0], data.pivot[1], data.pivot[2]);
                    var body = component.entity.rigidbody.body;
                    data.constraint = new Ammo.btPoint2PointConstraint(body, pivotA);

                    var pivotB = data.constraint.getPivotInB();
                    data.position = [ pivotB.x(), pivotB.y(), pivotB.z() ];

                    var context = this.context;
                    context.systems.rigidbody.addConstraint(data.constraint);
                }
            }

            properties = ['constraint', 'pivot', 'position', 'tau', 'damping', 'impulseClamp'];

            BallSocketJointComponentSystem._super.initializeComponentData.call(this, component, data, properties);
        },

        cloneComponent: function (entity, clone) {
            // overridden to make sure pivotA is duplicated
            var src = this.dataStore[entity.getGuid()];
            var data = {
                pivot: pc.extend([], src.data.pivot),
                position: pc.extend([], src.data.position)
            };
            return this.addComponent(clone, data);
        },
        
        onRemove: function (entity, data) {
            if (data.constraint) {
                this.context.systems.rigidbody.removeConstraint(data.constraint);
            }
        },

        /**
        * @function
        * @name pc.fw.BallSocketJointComponentSystem#setDebugRender
        * @description Display debug representation of the joint
        * @param {Boolean} value Enable or disable
        */
        setDebugRender: function (value) {
            this.debugRender = value;
        },

        onUpdate: function (dt) {
            if (this.debugRender) {
                this.updateDebugShapes();
            }
        },

        onToolsUpdate: function (dt) {
            this.updateDebugShapes();
        },

        updateDebugShapes: function () {
            var components = this.store;
            for (var id in components) {
                var entity = components[id].entity;
                var data = components[id].data;
            }
        }
    });

    return {
        BallSocketJointComponentSystem: BallSocketJointComponentSystem
    };
}());