System.register("chunks:///_virtual/ActionBar.ts", ['cc', './Painter.ts', './RetainedButton.ts', './selectors2.ts', './VariantRegistry.ts', './Typography.ts', './theme.ts'], function (exports) {
  var cclegacy, Label, RetainedButton, displayHand, canInteract, presentationFor, text, C;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      Label = module.Label;
    }, null, function (module) {
      RetainedButton = module.RetainedButton;
    }, function (module) {
      displayHand = module.displayHand;
      canInteract = module.canInteract;
    }, function (module) {
      presentationFor = module.presentationFor;
    }, function (module) {
      text = module.text;
    }, function (module) {
      C = module.C;
    }],
    execute: function () {
      cclegacy._RF.push({}, "497bdzB2P5Au4e76fVRuNA3", "ActionBar", undefined);
      var ActionBarView = exports('ActionBarView', /*#__PURE__*/function () {
        function ActionBarView(parent, actions) {
          this.status = void 0;
          this.log = void 0;
          this.buttons = [];
          this.parent = parent;
          this.actions = actions;
          this.status = text(parent, '', 650, 510, 18, C.gold, 700, 30).getComponent(Label);
          this.log = text(parent, '', 640, 546, 15, C.muted, 650, 30).getComponent(Label);
        }
        var _proto = ActionBarView.prototype;
        _proto.update = function update(state) {
          var _this = this;
          var game = state.game,
            variant = presentationFor(game.ruleId);
          var moves = game.legalMoves.filter(function (m) {
            return m.type !== 'discard';
          });
          var discard = game.legalMoves.some(function (m) {
            return m.type === 'discard';
          });
          var selected = state.selected >= 0 && discard ? displayHand(game)[state.selected] : undefined;
          this.status.string = state.busy ? '操作等待中…' : variant.turnMessage(game, selected);
          var entries = moves.map(function (move) {
            return {
              label: variant.actionLabel(move, game),
              width: move.type === 'chi' ? 176 : move.type === 'kong' ? 130 : 90,
              enabled: canInteract(state),
              primary: move.type === 'win',
              click: function click() {
                return _this.actions.move(move);
              }
            };
          });
          if (discard) entries.push({
            label: selected !== undefined ? '打出選牌' : '請選擇手牌',
            width: 150,
            enabled: selected !== undefined && canInteract(state),
            primary: true,
            click: function click() {
              if (selected !== undefined) _this.actions.move({
                type: 'discard',
                tile: selected
              });
            }
          });
          var total = entries.reduce(function (sum, e) {
            return sum + e.width;
          }, 0) + Math.max(0, entries.length - 1) * 10;
          var x = 640 - total / 2;
          entries.forEach(function (entry, i) {
            var _this$buttons$i;
            var button = (_this$buttons$i = _this.buttons[i]) != null ? _this$buttons$i : _this.buttons[i] = new RetainedButton(_this.parent);
            button.update(entry.label, x + entry.width / 2, 542, entry.width, 44, entry.click, entry.enabled, entry.primary);
            x += entry.width + 10;
          });
          for (var i = entries.length; i < this.buttons.length; i++) this.buttons[i].hide();
          this.log.string = !entries.length && game.phase !== 'ended' ? game.log[game.log.length - 1] || '' : '';
        };
        return ActionBarView;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/AppController.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './TableController.ts', './VariantRegistry.ts', './AppFlowMachine.ts'], function (exports) {
  var _extends, _createForOfIteratorHelperLoose, _asyncToGenerator, _regeneratorRuntime, cclegacy, TableController, DEMO_RULE_ID, AppFlowMachine;
  return {
    setters: [function (module) {
      _extends = module.extends;
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
      _asyncToGenerator = module.asyncToGenerator;
      _regeneratorRuntime = module.regeneratorRuntime;
    }, function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      TableController = module.TableController;
    }, function (module) {
      DEMO_RULE_ID = module.DEMO_RULE_ID;
    }, function (module) {
      AppFlowMachine = module.AppFlowMachine;
    }],
    execute: function () {
      cclegacy._RF.push({}, "29199fpantCEYUjPrmwYZ+B", "AppController", undefined);
      /** Coordinates app routes and feature controllers, without rules, storage or Cocos. */
      var AppController = exports('AppController', /*#__PURE__*/function () {
        function AppController(services, request) {
          var _this = this;
          if (request === void 0) {
            request = {
              ruleId: DEMO_RULE_ID,
              mode: 'practice'
            };
          }
          this.flow = new AppFlowMachine();
          this.table = void 0;
          this.ui = {
            modal: null,
            notice: '',
            resumable: null,
            records: [],
            loadingRecords: false,
            recordPage: 0
          };
          this.listeners = new Set();
          this.unsubscribe = void 0;
          this.matching = void 0;
          this.foreground = true;
          this.disposed = false;
          this.dispatch = function (intent) {
            if (_this.disposed) return;
            switch (intent.type) {
              case 'start':
                void _this.start();
                break;
              case 'resume':
                if (_this.ui.resumable && !_this.getState().busy && _this.flow.transition('RESUME')) void _this.enter(_this.ui.resumable);
                break;
              case 'request-new':
                _this.ui.modal = 'leave';
                _this.emit();
                break;
              case 'modal':
                _this.ui.modal = intent.modal;
                _this.emit();
                if (intent.modal === 'records') void _this.loadRecords();
                break;
              case 'confirm-leave':
                if (_this.flow.value === 'lobby') void _this.start();else if (_this.flow.transition('LEAVE')) {
                  _this.ui.modal = null;
                  _this.emit();
                  void _this.refreshResume();
                }
                break;
              case 'select-tile':
                _this.table.select(intent.index);
                break;
              case 'confirm-discard':
                _this.table.confirmDiscard();
                break;
              case 'move':
                void _this.table.send(intent.move);
                break;
              case 'records-page':
                _this.ui.recordPage = Math.max(0, Math.min(intent.page, Math.ceil(_this.ui.records.length / 5) - 1));
                _this.emit();
                break;
            }
          };
          this.services = services;
          this.request = request;
          this.table = new TableController(services.session);
          this.unsubscribe = this.table.subscribe(function (state) {
            var _state$game;
            if (((_state$game = state.game) == null ? void 0 : _state$game.phase) === 'ended' && (_this.flow.value === 'table' || _this.flow.value === 'enteringTable')) _this.ui.modal = 'result';
            _this.emit();
          });
        }
        var _proto = AppController.prototype;
        _proto.getState = function getState() {
          var table = this.table.getState(),
            inTable = this.flow.value === 'table' || this.flow.value === 'enteringTable';
          return _extends({}, this.ui, {
            flow: this.flow.value,
            screen: inTable ? 'table' : 'lobby',
            selectedRuleId: this.request.ruleId,
            game: table.game,
            selected: table.selected,
            busy: table.pending || ['booting', 'matching', 'enteringTable'].includes(this.flow.value),
            connection: table.connection,
            notice: this.ui.notice || (inTable ? table.notice : '')
          });
        };
        _proto.subscribe = function subscribe(listener) {
          var _this2 = this;
          this.listeners.add(listener);
          listener(this.getState());
          return function () {
            return _this2.listeners["delete"](listener);
          };
        };
        _proto.initialize = /*#__PURE__*/function () {
          var _initialize = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  _context.next = 2;
                  return this.refreshResume();
                case 2:
                  this.flow.transition('READY');
                  this.emit();
                case 4:
                case "end":
                  return _context.stop();
              }
            }, _callee, this);
          }));
          function initialize() {
            return _initialize.apply(this, arguments);
          }
          return initialize;
        }();
        _proto.setForeground = function setForeground(active) {
          this.foreground = active;
          this.syncLifecycle();
        };
        _proto.dispose = function dispose() {
          var _this$matching, _this$services$dispos, _this$services;
          this.disposed = true;
          (_this$matching = this.matching) == null || _this$matching.abort();
          this.unsubscribe();
          this.table.dispose();
          (_this$services$dispos = (_this$services = this.services).dispose) == null || _this$services$dispos.call(_this$services);
          this.listeners.clear();
        };
        _proto.emit = function emit() {
          if (this.disposed) return;
          this.syncLifecycle();
          var state = this.getState();
          for (var _iterator = _createForOfIteratorHelperLoose(this.listeners), _step; !(_step = _iterator()).done;) {
            var fn = _step.value;
            fn(state);
          }
        };
        _proto.syncLifecycle = function syncLifecycle() {
          this.table.setForeground(this.foreground);
          this.table.setPresentationActive(this.flow.value === 'table' && this.ui.modal === null);
        };
        _proto.refreshResume = /*#__PURE__*/function () {
          var _refreshResume = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
            return _regeneratorRuntime().wrap(function _callee2$(_context2) {
              while (1) switch (_context2.prev = _context2.next) {
                case 0:
                  _context2.prev = 0;
                  _context2.next = 3;
                  return this.services.matchmaking.findResumable();
                case 3:
                  this.ui.resumable = _context2.sent;
                  _context2.next = 10;
                  break;
                case 6:
                  _context2.prev = 6;
                  _context2.t0 = _context2["catch"](0);
                  this.ui.resumable = null;
                  this.ui.notice = this.error(_context2.t0);
                case 10:
                  this.emit();
                case 11:
                case "end":
                  return _context2.stop();
              }
            }, _callee2, this, [[0, 6]]);
          }));
          function refreshResume() {
            return _refreshResume.apply(this, arguments);
          }
          return refreshResume;
        }();
        _proto.start = /*#__PURE__*/function () {
          var _start = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3() {
            var ticket;
            return _regeneratorRuntime().wrap(function _callee3$(_context3) {
              while (1) switch (_context3.prev = _context3.next) {
                case 0:
                  if (!(this.getState().busy || !this.flow.transition('MATCH'))) {
                    _context3.next = 2;
                    break;
                  }
                  return _context3.abrupt("return");
                case 2:
                  this.ui.notice = '';
                  this.ui.modal = null;
                  this.emit();
                  this.matching = new AbortController();
                  _context3.prev = 6;
                  _context3.next = 9;
                  return this.services.matchmaking.match(this.request, this.matching.signal);
                case 9:
                  ticket = _context3.sent;
                  if (!this.disposed) {
                    _context3.next = 12;
                    break;
                  }
                  return _context3.abrupt("return");
                case 12:
                  this.flow.transition('MATCHED');
                  _context3.next = 15;
                  return this.enter(ticket);
                case 15:
                  _context3.next = 22;
                  break;
                case 17:
                  _context3.prev = 17;
                  _context3.t0 = _context3["catch"](6);
                  this.flow.transition('FAILED');
                  this.ui.notice = this.error(_context3.t0);
                  this.emit();
                case 22:
                case "end":
                  return _context3.stop();
              }
            }, _callee3, this, [[6, 17]]);
          }));
          function start() {
            return _start.apply(this, arguments);
          }
          return start;
        }();
        _proto.enter = /*#__PURE__*/function () {
          var _enter = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(ticket) {
            return _regeneratorRuntime().wrap(function _callee4$(_context4) {
              while (1) switch (_context4.prev = _context4.next) {
                case 0:
                  if (!this.disposed) {
                    _context4.next = 2;
                    break;
                  }
                  return _context4.abrupt("return");
                case 2:
                  this.ui.modal = null;
                  this.ui.notice = '';
                  this.emit();
                  _context4.prev = 5;
                  _context4.next = 8;
                  return this.table.connect(ticket);
                case 8:
                  if (!this.disposed) {
                    _context4.next = 10;
                    break;
                  }
                  return _context4.abrupt("return");
                case 10:
                  this.flow.transition('ENTERED');
                  this.emit();
                  _context4.next = 21;
                  break;
                case 14:
                  _context4.prev = 14;
                  _context4.t0 = _context4["catch"](5);
                  this.flow.transition('FAILED');
                  this.ui.notice = this.error(_context4.t0);
                  this.emit();
                  _context4.next = 21;
                  return this.refreshResume();
                case 21:
                case "end":
                  return _context4.stop();
              }
            }, _callee4, this, [[5, 14]]);
          }));
          function enter(_x) {
            return _enter.apply(this, arguments);
          }
          return enter;
        }();
        _proto.loadRecords = /*#__PURE__*/function () {
          var _loadRecords = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5() {
            return _regeneratorRuntime().wrap(function _callee5$(_context5) {
              while (1) switch (_context5.prev = _context5.next) {
                case 0:
                  this.ui.loadingRecords = true;
                  this.ui.recordPage = 0;
                  this.emit();
                  _context5.prev = 3;
                  _context5.next = 6;
                  return this.services.records.list();
                case 6:
                  this.ui.records = _context5.sent;
                  _context5.next = 12;
                  break;
                case 9:
                  _context5.prev = 9;
                  _context5.t0 = _context5["catch"](3);
                  this.ui.notice = this.error(_context5.t0);
                case 12:
                  _context5.prev = 12;
                  this.ui.loadingRecords = false;
                  this.emit();
                  return _context5.finish(12);
                case 16:
                case "end":
                  return _context5.stop();
              }
            }, _callee5, this, [[3, 9, 12, 16]]);
          }));
          function loadRecords() {
            return _loadRecords.apply(this, arguments);
          }
          return loadRecords;
        }();
        _proto.error = function error(value) {
          return value instanceof Error ? value.message : '暫時無法完成操作，請稍後再試。';
        };
        return AppController;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/AppEntry.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './Drawing.ts', './AppController.ts', './AppRenderer.ts', './createServices.ts', './KeyboardInput.ts', './ViewActions2.ts'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, cclegacy, _decorator, Prefab, profiler, view, ResolutionPolicy, sys, game, Game, Node, Layers, UITransform, Camera, Color, Canvas, Component, node, AppController, AppRenderer, createServices, KeyboardInput, createViewActions;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Prefab = module.Prefab;
      profiler = module.profiler;
      view = module.view;
      ResolutionPolicy = module.ResolutionPolicy;
      sys = module.sys;
      game = module.game;
      Game = module.Game;
      Node = module.Node;
      Layers = module.Layers;
      UITransform = module.UITransform;
      Camera = module.Camera;
      Color = module.Color;
      Canvas = module.Canvas;
      Component = module.Component;
    }, function (module) {
      node = module.node;
    }, function (module) {
      AppController = module.AppController;
    }, function (module) {
      AppRenderer = module.AppRenderer;
    }, function (module) {
      createServices = module.createServices;
    }, function (module) {
      KeyboardInput = module.KeyboardInput;
    }, function (module) {
      createViewActions = module.createViewActions;
    }],
    execute: function () {
      var _dec, _dec2, _class, _class2, _descriptor, _descriptor2, _descriptor3;
      cclegacy._RF.push({}, "2dfb2fGGQhPGaofGMkJ9W0s", "AppEntry", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      /** Scene entry: engine lifecycle and dependency wiring. No game or screen logic. */
      var AppEntry = exports('AppEntry', (_dec = ccclass('AppEntry'), _dec2 = property(Prefab), _dec(_class = (_class2 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(AppEntry, _Component);
        function AppEntry() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "tilePrefab", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "useWebSocket", _descriptor2, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "websocketEndpoint", _descriptor3, _assertThisInitialized(_this));
          _this.controller = void 0;
          _this.renderer = void 0;
          _this.keyboard = void 0;
          _this.unsubscribe = void 0;
          return _this;
        }
        var _proto = AppEntry.prototype;
        _proto.onLoad = function onLoad() {
          var _this2 = this;
          profiler.hideStats();
          view.setDesignResolutionSize(1280, 720, ResolutionPolicy.SHOW_ALL);
          view.resizeWithBrowserSize(true);
          var surface = this.createCanvas();
          var remote = this.useWebSocket || typeof location !== 'undefined' && new URLSearchParams(location.search).get('transport') === 'ws';
          var services = createServices({
            getItem: function getItem(key) {
              return sys.localStorage.getItem(key);
            },
            setItem: function setItem(key, value) {
              return sys.localStorage.setItem(key, value);
            },
            removeItem: function removeItem(key) {
              return sys.localStorage.removeItem(key);
            }
          }, remote ? {
            mode: 'websocket',
            network: {
              endpoint: this.websocketEndpoint
            }
          } : {
            mode: 'local'
          });
          this.controller = new AppController(services);
          if (!this.tilePrefab) throw Error('Main.scene 未指定 Tile.prefab');
          this.renderer = new AppRenderer(surface, createViewActions(this.controller.dispatch), this.tilePrefab);
          this.unsubscribe = this.controller.subscribe(function (state) {
            return _this2.renderer.render(state);
          });
          this.keyboard = new KeyboardInput(function () {
            return _this2.controller.getState();
          }, this.controller.dispatch);
          game.on(Game.EVENT_HIDE, this.onHide, this);
          game.on(Game.EVENT_SHOW, this.onShow, this);
          view.on('canvas-resize', this.onResize, this);
          void this.controller.initialize();
        };
        _proto.onDestroy = function onDestroy() {
          var _this$unsubscribe, _this$keyboard, _this$controller, _this$renderer;
          (_this$unsubscribe = this.unsubscribe) == null || _this$unsubscribe.call(this);
          (_this$keyboard = this.keyboard) == null || _this$keyboard.dispose();
          (_this$controller = this.controller) == null || _this$controller.dispose();
          (_this$renderer = this.renderer) == null || _this$renderer.dispose();
          game.off(Game.EVENT_HIDE, this.onHide, this);
          game.off(Game.EVENT_SHOW, this.onShow, this);
          view.off('canvas-resize', this.onResize, this);
        };
        _proto.onHide = function onHide() {
          this.controller.setForeground(false);
        };
        _proto.onShow = function onShow() {
          this.controller.setForeground(true);
        };
        _proto.onResize = function onResize() {
          if (this.controller) this.renderer.render(this.controller.getState(), true);
        };
        _proto.createCanvas = function createCanvas() {
          var canvasNode = new Node('Canvas');
          canvasNode.layer = Layers.Enum.UI_2D;
          canvasNode.parent = this.node;
          canvasNode.addComponent(UITransform).setContentSize(1280, 720);
          var cameraNode = new Node('UICamera');
          cameraNode.parent = this.node;
          cameraNode.setPosition(640, 360, 1000);
          var camera = cameraNode.addComponent(Camera);
          camera.projection = Camera.ProjectionType.ORTHO;
          camera.orthoHeight = 360;
          camera.near = 0.1;
          camera.far = 2000;
          camera.clearFlags = Camera.ClearFlag.SOLID_COLOR;
          camera.clearColor = new Color(16, 31, 29, 255);
          camera.visibility = Layers.Enum.UI_2D;
          var canvas = canvasNode.addComponent(Canvas);
          canvas.cameraComponent = camera;
          canvas.alignCanvasWithScreen = true;
          return node(canvasNode, 'Interface', -640, -360, 1280, 720);
        };
        return AppEntry;
      }(Component), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "tilePrefab", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "useWebSocket", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return false;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "websocketEndpoint", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 'ws://127.0.0.1:8787/';
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/AppFlowMachine.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _createClass, cclegacy;
  return {
    setters: [function (module) {
      _createClass = module.createClass;
    }, function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      cclegacy._RF.push({}, "c7c27tUyq9OTasjXjNb4/OS", "AppFlowMachine", undefined);
      var transitions = {
        booting: {
          READY: 'lobby',
          AUTH_REQUIRED: 'authentication'
        },
        authentication: {
          AUTHENTICATED: 'lobby'
        },
        lobby: {
          MATCH: 'matching',
          RESUME: 'enteringTable'
        },
        matching: {
          MATCHED: 'enteringTable',
          FAILED: 'lobby'
        },
        enteringTable: {
          ENTERED: 'table',
          FAILED: 'lobby'
        },
        table: {
          LEAVE: 'lobby',
          MATCH: 'matching'
        }
      };
      /** Navigation state only; connection and tile selection do not belong here. */
      var AppFlowMachine = exports('AppFlowMachine', /*#__PURE__*/function () {
        function AppFlowMachine() {
          this.current = 'booting';
        }
        var _proto = AppFlowMachine.prototype;
        _proto.transition = function transition(event) {
          var _transitions$this$cur;
          var next = (_transitions$this$cur = transitions[this.current]) == null ? void 0 : _transitions$this$cur[event];
          if (!next) return false;
          this.current = next;
          return true;
        };
        _createClass(AppFlowMachine, [{
          key: "value",
          get: function get() {
            return this.current;
          }
        }]);
        return AppFlowMachine;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/AppRenderer.ts", ['cc', './LobbyView.ts', './TableView.ts', './TilePool.ts', './Bamboo.ts', './Painter.ts', './ModalLayer.ts', './Typography.ts', './theme.ts', './Drawing.ts'], function (exports) {
  var cclegacy, renderLobby, TableView, TilePool, drawBamboo, renderModal, text, C, rect, line, node;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      renderLobby = module.renderLobby;
    }, function (module) {
      TableView = module.TableView;
    }, function (module) {
      TilePool = module.TilePool;
    }, function (module) {
      drawBamboo = module.drawBamboo;
    }, null, function (module) {
      renderModal = module.renderModal;
    }, function (module) {
      text = module.text;
    }, function (module) {
      C = module.C;
    }, function (module) {
      rect = module.rect;
      line = module.line;
      node = module.node;
    }],
    execute: function () {
      cclegacy._RF.push({}, "bd2a9KoUklKnrf+ERkkmJxu", "AppRenderer", undefined);
      var AppRenderer = exports('AppRenderer', /*#__PURE__*/function () {
        function AppRenderer(root, actions, tilePrefab) {
          this.screen = void 0;
          this.modal = void 0;
          this.notice = void 0;
          this.table = void 0;
          this.lobbyTiles = void 0;
          this.modalTiles = void 0;
          this.previous = void 0;
          this.tiles = void 0;
          this.root = root;
          this.actions = actions;
          this.tiles = new TilePool(tilePrefab);
          rect(root, 640, 360, 1280, 720, C.bg);
          for (var y = 0; y < 720; y += 12) line(root, 0, y, 1280, y, '#152824');
          drawBamboo(root, 1170, 530, 0.75);
          drawBamboo(root, 40, 120, 0.4);
          this.screen = node(root, 'ScreenLayer', 0, 0, 1280, 720);
          this.modal = node(root, 'ModalLayer', 0, 0, 1280, 720);
          this.notice = node(root, 'NoticeLayer', 0, 0, 1280, 720);
        }
        var _proto = AppRenderer.prototype;
        _proto.render = function render(state, force) {
          var _prev$resumable, _state$resumable;
          if (force === void 0) {
            force = false;
          }
          var prev = this.previous;
          if (force || !prev || prev.screen !== state.screen || prev.game !== state.game || prev.selected !== state.selected || prev.busy !== state.busy || ((_prev$resumable = prev.resumable) == null ? void 0 : _prev$resumable.sessionId) !== ((_state$resumable = state.resumable) == null ? void 0 : _state$resumable.sessionId) || prev.connection !== state.connection) {
            if (state.screen === 'table' && state.game) {
              if (force || !this.table) {
                this.clearScreen();
                this.table = new TableView(this.screen, this.tiles, this.actions);
              }
              this.table.update(state);
            } else {
              this.clearScreen();
              if (state.screen === 'lobby') this.lobbyTiles = renderLobby(this.screen, state, this.actions, this.tiles);else text(this.screen, '正在入座…', 640, 360, 28, C.gold, 600, 70);
            }
          }
          if (force || !prev || prev.modal !== state.modal || prev.game !== state.game || prev.busy !== state.busy || prev.records !== state.records || prev.loadingRecords !== state.loadingRecords || prev.recordPage !== state.recordPage || prev.notice !== state.notice) {
            var _this$modalTiles;
            (_this$modalTiles = this.modalTiles) == null || _this$modalTiles.dispose();
            this.modalTiles = undefined;
            this.clear(this.modal);
            this.modalTiles = renderModal(this.modal, state, this.actions, this.tiles);
          }
          if (force || !prev || prev.notice !== state.notice) {
            this.clear(this.notice);
            if (state.notice) {
              rect(this.notice, 640, 665, 840, 44, '#4e342c', 8);
              text(this.notice, state.notice, 640, 665, 19, C.ivory, 810, 40);
            }
          }
          this.previous = state;
        };
        _proto.dispose = function dispose() {
          var _this$modalTiles2;
          this.clearScreen();
          (_this$modalTiles2 = this.modalTiles) == null || _this$modalTiles2.dispose();
          this.modalTiles = undefined;
          this.tiles.dispose();
        };
        _proto.clearScreen = function clearScreen() {
          var _this$table, _this$lobbyTiles;
          (_this$table = this.table) == null || _this$table.dispose();
          this.table = undefined;
          (_this$lobbyTiles = this.lobbyTiles) == null || _this$lobbyTiles.dispose();
          this.lobbyTiles = undefined;
          this.clear(this.screen);
        };
        _proto.clear = function clear(parent) {
          for (var _i = 0, _arr = [].concat(parent.children); _i < _arr.length; _i++) {
            var child = _arr[_i];
            child.removeFromParent();
            child.destroy();
          }
        };
        return AppRenderer;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/AppState.ts", ['cc'], function () {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      cclegacy._RF.push({}, "cce88GCepZG55QUiiWxMk6Q", "AppState", undefined);
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/Bamboo.ts", ['cc', './Painter.ts', './Drawing.ts'], function (exports) {
  var cclegacy, node, line;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, null, function (module) {
      node = module.node;
      line = module.line;
    }],
    execute: function () {
      exports('drawBamboo', drawBamboo);
      cclegacy._RF.push({}, "4bb67n3tsBEsam1WfKfNGoa", "Bamboo", undefined);
      function drawBamboo(p, x, y, scale) {
        var b = node(p, '竹影', x, y, 0, 0);
        b.setScale(scale, scale, 1);
        for (var stem = 0; stem < 3; stem++) {
          var xx = stem * 40;
          line(b, xx, 160, xx - 40, -170, '#244134', 4);
          for (var j = 0; j < 5; j++) {
            var yy = 120 - j * 58;
            line(b, xx - 16 + j * -6, yy, xx + 1 + j * -6, yy, '#315342', 2);
            line(b, xx - 8 - j * 6, yy, xx + 64 - j * 6, yy - 36, '#294938', 2);
            line(b, xx + 15 - j * 6, yy - 12, xx + 16 - j * 6, yy - 45, '#294938', 6);
            line(b, xx + 40 - j * 6, yy - 24, xx + 58 - j * 6, yy - 54, '#294938', 6);
          }
        }
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/bot.ts", ['cc', './rules.ts'], function (exports) {
  var cclegacy, counts, legalMoves;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      counts = module.counts;
      legalMoves = module.legalMoves;
    }],
    execute: function () {
      exports({
        botMove: botMove,
        chooseDiscard: chooseDiscard
      });
      cclegacy._RF.push({}, "76784iuu5tXMpCxfCc2Ak9c", "bot", undefined);
      /** Basic local opponent, no access to wall/opponent hands when choosing a discard. */
      function chooseDiscard(hand) {
        var c = counts(hand);
        var score = function score(t) {
          var v = c[t] >= 3 ? 9 : c[t] === 2 ? 5 : 0;
          if (t < 27) {
            var r = t % 9;
            v += (r > 0 ? c[t - 1] : 0) * 2.2 + (r < 8 ? c[t + 1] : 0) * 2.2 + (r > 1 ? c[t - 2] : 0) * 0.8 + (r < 7 ? c[t + 2] : 0) * 0.8;
            if (r === 0 || r === 8) v -= 0.3;
          } else v -= 0.5;
          return v;
        };
        return Array.from(new Set(hand)).sort(function (a, b) {
          return score(a) - score(b) || a - b;
        })[0];
      }
      function botMove(s, seat) {
        var moves = legalMoves(s, seat);
        if (!moves.length) return null;
        var win = moves.find(function (m) {
          return m.type === 'win';
        });
        if (win) return win;
        var kong = moves.find(function (m) {
          return m.type === 'kong';
        });
        if (kong) return kong;
        if (s.phase === 'claim') return moves.find(function (m) {
          return m.type === 'pon';
        }) || moves.find(function (m) {
          return m.type === 'chi';
        }) || {
          type: 'pass'
        };
        return {
          type: 'discard',
          tile: chooseDiscard(s.players[seat].hand)
        };
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/Brand.ts", ['cc', './Painter.ts', './Drawing.ts', './theme.ts', './Typography.ts'], function (exports) {
  var cclegacy, rect, C, text;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, null, function (module) {
      rect = module.rect;
    }, function (module) {
      C = module.C;
    }, function (module) {
      text = module.text;
    }],
    execute: function () {
      exports('drawBrand', drawBrand);
      cclegacy._RF.push({}, "70fe20Y5xlLoayEqa0eyyaq", "Brand", undefined);
      function drawBrand(p) {
        rect(p, 62, 43, 36, 36, C.gold, 7);
        text(p, '竹', 62, 43, 25, C.bg, 34, 34, 'center', true);
        text(p, '青竹麻將', 166, 42, 22, C.ivory, 142, 36, 'left');
        text(p, 'Q I N G Z H U', 310, 43, 11, C.muted, 135, 26, 'left');
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/Button.ts", ['cc', './Drawing.ts', './theme.ts', './Typography.ts', './Viewport.ts'], function (exports) {
  var cclegacy, UITransform, Node, rect, C, text, uiScale;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      UITransform = module.UITransform;
      Node = module.Node;
    }, function (module) {
      rect = module.rect;
    }, function (module) {
      C = module.C;
    }, function (module) {
      text = module.text;
    }, function (module) {
      uiScale = module.uiScale;
    }],
    execute: function () {
      exports('button', button);
      cclegacy._RF.push({}, "5d947vbHRZM0LXn1vt1qQX/", "Button", undefined);
      function button(parent, label, x, y, w, h, click, primary, enabled) {
        if (primary === void 0) {
          primary = false;
        }
        if (enabled === void 0) {
          enabled = true;
        }
        var n = rect(parent, x, y, w, h, enabled ? primary ? C.gold : '#234b3e' : '#263b32', 10, primary ? undefined : C.line);
        n.getComponent(UITransform).setContentSize(Math.max(w, 44 / uiScale()), Math.max(h, 44 / uiScale()));
        n.name = "button:" + label;
        text(n, label, 0, 0, 22, enabled ? primary ? C.bg : C.ivory : C.muted, w - 18, h);
        if (enabled) {
          n.on(Node.EventType.TOUCH_END, function (e) {
            e.propagationStopped = true;
            click();
          });
        }
        return n;
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/clone.ts", ['cc'], function (exports) {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      cclegacy._RF.push({}, "a4818/S6YxJu5BeTvoGo0Xe", "clone", undefined);
      var clone = exports('clone', function clone(x) {
        return JSON.parse(JSON.stringify(x));
      });
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/ConnectionMachine.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _createClass, cclegacy;
  return {
    setters: [function (module) {
      _createClass = module.createClass;
    }, function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      cclegacy._RF.push({}, "328c0BYyHBEYqN2rwV7x+DG", "ConnectionMachine", undefined);
      var transitions = {
        idle: {
          CONNECT: 'connecting'
        },
        connecting: {
          TRANSPORT_READY: 'synchronizing',
          SNAPSHOT: 'connected',
          LOST: 'reconnecting',
          CLOSE: 'closed'
        },
        synchronizing: {
          SNAPSHOT: 'connected',
          LOST: 'reconnecting',
          CLOSE: 'closed'
        },
        connected: {
          CONNECT: 'connecting',
          TRANSPORT_READY: 'synchronizing',
          SNAPSHOT: 'connected',
          LOST: 'reconnecting',
          CLOSE: 'closed'
        },
        reconnecting: {
          CONNECT: 'connecting',
          TRANSPORT_READY: 'synchronizing',
          SNAPSHOT: 'connected',
          CLOSE: 'closed'
        },
        closed: {
          CONNECT: 'connecting'
        }
      };
      /** Transport ready does not mean playable: an authoritative snapshot is required. */
      var ConnectionMachine = exports('ConnectionMachine', /*#__PURE__*/function () {
        function ConnectionMachine() {
          this.current = 'idle';
        }
        var _proto = ConnectionMachine.prototype;
        _proto.transition = function transition(event) {
          var _transitions$this$cur;
          this.current = (_transitions$this$cur = transitions[this.current][event]) != null ? _transitions$this$cur : this.current;
        };
        _createClass(ConnectionMachine, [{
          key: "value",
          get: function get() {
            return this.current;
          }
        }]);
        return ConnectionMachine;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/createServices.ts", ['cc', './MockGameSession.ts', './MockMatchmaking.ts', './MockRecordStore.ts', './WsClient.ts', './ResumeTicketStore.ts', './WsGameSession.ts', './WsMatchmaking.ts', './WsRecordService.ts'], function (exports) {
  var cclegacy, MockGameSession, MockMatchmaking, MockRecordStore, WsClient, ResumeTicketStore, WsGameSession, WsMatchmaking, WsRecordService;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      MockGameSession = module.MockGameSession;
    }, function (module) {
      MockMatchmaking = module.MockMatchmaking;
    }, function (module) {
      MockRecordStore = module.MockRecordStore;
    }, function (module) {
      WsClient = module.WsClient;
    }, function (module) {
      ResumeTicketStore = module.ResumeTicketStore;
    }, function (module) {
      WsGameSession = module.WsGameSession;
    }, function (module) {
      WsMatchmaking = module.WsMatchmaking;
    }, function (module) {
      WsRecordService = module.WsRecordService;
    }],
    execute: function () {
      exports('createServices', createServices);
      cclegacy._RF.push({}, "1a80amT6hFPAppa+0VzGjae", "createServices", undefined);
      /** Composition root. Replace these adapters with backend implementations here. */
      function createServices(storage, config) {
        if (config === void 0) {
          config = {
            mode: 'local'
          };
        }
        if (config.mode === 'websocket') {
          var client = new WsClient(config.network);
          var tickets = new ResumeTicketStore(storage, client.transport.endpoint);
          return {
            session: new WsGameSession(client),
            matchmaking: new WsMatchmaking(client, tickets),
            records: new WsRecordService(client, tickets),
            dispose: function dispose() {
              return client.dispose();
            }
          };
        }
        var records = new MockRecordStore(storage);
        return {
          records: records,
          session: new MockGameSession(storage, records),
          matchmaking: new MockMatchmaking(storage)
        };
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/Drawing.ts", ['cc', './theme.ts'], function (exports) {
  var cclegacy, Node, Layers, UITransform, Graphics, col, C;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      Node = module.Node;
      Layers = module.Layers;
      UITransform = module.UITransform;
      Graphics = module.Graphics;
    }, function (module) {
      col = module.col;
      C = module.C;
    }],
    execute: function () {
      exports({
        circle: circle,
        line: line,
        node: node,
        rect: rect
      });
      cclegacy._RF.push({}, "4294bNV9oxPAbeVXlfVUgvl", "Drawing", undefined);
      function node(parent, name, x, y, w, h) {
        var n = new Node(name);
        n.layer = Layers.Enum.UI_2D;
        n.parent = parent;
        n.setPosition(x, -y, 0);
        n.addComponent(UITransform).setContentSize(w, h);
        return n;
      }
      function rect(parent, x, y, w, h, fill, r, stroke) {
        if (r === void 0) {
          r = 0;
        }
        var n = node(parent, 'surface', x, y, w, h),
          g = n.addComponent(Graphics);
        g.fillColor = col(fill);
        g.roundRect(-w / 2, -h / 2, w, h, r);
        g.fill();
        if (stroke) {
          g.strokeColor = col(stroke);
          g.lineWidth = 1;
          g.stroke();
        }
        return n;
      }
      function line(parent, x1, y1, x2, y2, color, width) {
        if (color === void 0) {
          color = C.line;
        }
        if (width === void 0) {
          width = 1;
        }
        var n = node(parent, 'line', 0, 0, 0, 0),
          g = n.addComponent(Graphics);
        g.strokeColor = col(color);
        g.lineWidth = width;
        g.moveTo(x1, -y1);
        g.lineTo(x2, -y2);
        g.stroke();
      }
      function circle(parent, x, y, r, fill, stroke) {
        var n = node(parent, 'circle', x, y, r * 2, r * 2),
          g = n.addComponent(Graphics);
        g.fillColor = col(fill);
        g.circle(0, 0, r);
        g.fill();
        if (stroke) {
          g.lineWidth = 1;
          g.strokeColor = col(stroke);
          g.stroke();
        }
        return n;
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/engine.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './model.ts', './rules.ts', './clone.ts', './tiles.ts'], function (exports) {
  var _createForOfIteratorHelperLoose, cclegacy, sameMove, NAMES, seatNext, legalMoves, reactionMoves, clone, tileName;
  return {
    setters: [function (module) {
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      sameMove = module.sameMove;
      NAMES = module.NAMES;
      seatNext = module.seatNext;
    }, function (module) {
      legalMoves = module.legalMoves;
      reactionMoves = module.reactionMoves;
    }, function (module) {
      clone = module.clone;
    }, function (module) {
      tileName = module.tileName;
    }],
    execute: function () {
      exports({
        applyMove: applyMove,
        assertState: assertState,
        newGame: newGame
      });
      cclegacy._RF.push({}, "85c5etBdXFVxbuASLhvg64n", "engine", undefined);
      function newGame(random, id) {
        if (random === void 0) {
          random = Math.random;
        }
        if (id === void 0) {
          id = "local-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
        }
        var wall = Array.from({
          length: 136
        }, function (_, i) {
          return Math.floor(i / 4);
        });
        for (var i = wall.length - 1; i > 0; i--) {
          var j = Math.floor(random() * (i + 1));
          var _ref = [wall[j], wall[i]];
          wall[i] = _ref[0];
          wall[j] = _ref[1];
        }
        var now = new Date().toISOString();
        var s = {
          schema: 1,
          id: id,
          ruleId: 'demo-13-v1',
          revision: 0,
          createdAt: now,
          updatedAt: now,
          dealer: 0,
          current: 0,
          phase: 'discard',
          wall: wall,
          players: NAMES.map(function (name, i) {
            return {
              seat: i,
              name: name,
              hand: [],
              melds: [],
              river: []
            };
          }),
          claims: [],
          mayKong: true,
          log: ['東家開局，祝你手氣順。']
        };
        for (var n = 0; n < 13; n++) {
          for (var _iterator = _createForOfIteratorHelperLoose(s.players), _step; !(_step = _iterator()).done;) {
            var p = _step.value;
            p.hand.push(s.wall.pop());
          }
        }
        s.lastDraw = s.wall.pop();
        s.players[0].hand.push(s.lastDraw);
        s.players.forEach(function (p) {
          return p.hand.sort(function (a, b) {
            return a - b;
          });
        });
        return s;
      }
      function log(s, message) {
        s.log.push(message);
        s.log = s.log.slice(-60);
      }
      function take(hand, tile, n) {
        if (n === void 0) {
          n = 1;
        }
        for (var i = 0; i < n; i++) {
          var at = hand.indexOf(tile);
          if (at < 0) throw Error('手牌不符');
          hand.splice(at, 1);
        }
      }
      function finish(s, outcome) {
        s.phase = 'ended';
        s.outcome = outcome;
        s.claims = [];
        log(s, outcome.reason);
      }
      function win(s, seat, from) {
        var _s$lastDiscard;
        var delta = [0, 0, 0, 0];
        delta[seat] = 3;
        if (from === undefined) for (var i = 0; i < 4; i++) {
          if (i !== seat) delta[i] = -1;
        } else delta[from] = -3;
        finish(s, {
          kind: from === undefined ? 'selfDraw' : 'discardWin',
          winner: seat,
          loser: from,
          tile: from === undefined ? s.lastDraw : (_s$lastDiscard = s.lastDiscard) == null ? void 0 : _s$lastDiscard.tile,
          delta: delta,
          reason: "" + s.players[seat].name + (from === undefined ? '自摸' : '胡牌') + "\uFF0C\u7372\u5F97 3 \u5206"
        });
      }
      function draw(s, seat) {
        s.current = seat;
        s.claims = [];
        s.lastDraw = undefined;
        s.mayKong = true;
        if (!s.wall.length) {
          finish(s, {
            kind: 'draw',
            delta: [0, 0, 0, 0],
            reason: '牌山已盡，本局流局'
          });
          return;
        }
        var tile = s.wall.pop();
        s.lastDraw = tile;
        s.players[seat].hand.push(tile);
        s.players[seat].hand.sort(function (a, b) {
          return a - b;
        });
        s.phase = 'discard';
      }
      function resolve(s) {
        if (s.claims.some(function (c) {
          return !c.choice;
        })) return;
        var last = s.lastDiscard;
        var rank = function rank(m) {
          return m.type === 'win' ? 3 : m.type === 'pon' || m.type === 'kong' ? 2 : m.type === 'chi' ? 1 : 0;
        };
        var claims = s.claims.filter(function (c) {
          return c.choice.type !== 'pass';
        }).sort(function (a, b) {
          return rank(b.choice) - rank(a.choice) || (a.seat - last.seat + 4) % 4 - (b.seat - last.seat + 4) % 4;
        });
        if (!claims.length) {
          draw(s, seatNext(last.seat));
          return;
        }
        var selected = claims[0],
          p = s.players[selected.seat],
          choice = selected.choice;
        if (choice.type === 'win') {
          win(s, selected.seat, last.seat);
          return;
        }
        // Claimed tiles move out of the river, keeping all 136 tiles conserved.
        s.players[last.seat].river.pop();
        if (choice.type === 'pon') {
          take(p.hand, last.tile, 2);
          p.melds.push({
            kind: 'pon',
            tiles: [last.tile, last.tile, last.tile],
            from: last.seat
          });
        }
        if (choice.type === 'chi') {
          choice.tiles.forEach(function (t) {
            return take(p.hand, t);
          });
          p.melds.push({
            kind: 'chi',
            tiles: [].concat(choice.tiles, [last.tile]).sort(function (a, b) {
              return a - b;
            }),
            from: last.seat
          });
        }
        if (choice.type === 'kong') {
          take(p.hand, last.tile, 3);
          p.melds.push({
            kind: 'kong',
            tiles: Array(4).fill(last.tile),
            from: last.seat
          });
        }
        log(s, "" + p.name + (choice.type === 'pon' ? '碰' : choice.type === 'chi' ? '吃' : '槓') + " " + tileName(last.tile));
        s.current = selected.seat;
        s.claims = [];
        s.lastDiscard = undefined;
        s.lastDraw = undefined;
        s.mayKong = false;
        s.phase = 'discard';
        if (choice.type === 'kong') draw(s, selected.seat);
      }
      /** Pure transition: rejects invalid operations without mutating the caller's state. */
      function applyMove(input, seat, move) {
        if (!legalMoves(input, seat).some(function (m) {
          return sameMove(m, move);
        })) throw Error('目前無法執行這個操作');
        var s = clone(input);
        s.revision++;
        s.updatedAt = new Date().toISOString();
        if (s.phase === 'claim') {
          s.claims.find(function (c) {
            return c.seat === seat;
          }).choice = clone(move);
          resolve(s);
          return s;
        }
        var p = s.players[seat];
        if (move.type === 'win') {
          win(s, seat);
          return s;
        }
        if (move.type === 'kong') {
          take(p.hand, move.tile, 4);
          p.melds.push({
            kind: 'concealedKong',
            tiles: Array(4).fill(move.tile),
            from: seat
          });
          log(s, p.name + "\u6697\u69D3");
          draw(s, seat);
          return s;
        }
        if (move.type !== 'discard') throw Error('不支援的操作');
        take(p.hand, move.tile);
        p.river.push(move.tile);
        s.lastDiscard = {
          seat: seat,
          tile: move.tile
        };
        s.lastDraw = undefined;
        log(s, p.name + "\u6253\u51FA " + tileName(move.tile));
        s.claims = [0, 1, 2, 3].map(function (other) {
          return {
            seat: other,
            moves: reactionMoves(s, other)
          };
        }).filter(function (c) {
          return c.moves.length > 0;
        });
        if (s.claims.length) s.phase = 'claim';else draw(s, seatNext(seat));
        return s;
      }
      /** Used for saved-state validation and simulation invariants, not for accepting client state on a server. */
      function assertState(s) {
        if (!s || s.schema !== 1 || s.ruleId !== 'demo-13-v1' || !['discard', 'claim', 'ended'].includes(s.phase) || !Number.isInteger(s.revision) || s.revision < 0 || !Array.isArray(s.players) || s.players.length !== 4 || !Array.isArray(s.wall) || !Array.isArray(s.claims) || !Array.isArray(s.log) || typeof s.id !== 'string' || s.current < 0 || s.current > 3) throw Error('存檔格式不相容');
        var tiles = [].concat(s.wall);
        for (var _iterator2 = _createForOfIteratorHelperLoose(s.players.entries()), _step2; !(_step2 = _iterator2()).done;) {
          var _step2$value = _step2.value,
            i = _step2$value[0],
            p = _step2$value[1];
          if (p.seat !== i || !Array.isArray(p.hand) || !Array.isArray(p.river) || !Array.isArray(p.melds) || p.melds.length > 4) throw Error('玩家存檔不完整');
          tiles.push.apply(tiles, p.hand.concat(p.river, p.melds.flatMap(function (m) {
            return m.tiles;
          })));
          var _expected = 13 - p.melds.length * 3 + (s.phase === 'discard' && s.current === i ? 1 : 0);
          if (s.phase !== 'ended' && p.hand.length !== _expected) throw Error('手牌數量不符');
        }
        if (tiles.length !== 136) throw Error('牌張總數不符');
        var c = Array(34).fill(0);
        for (var _iterator3 = _createForOfIteratorHelperLoose(tiles), _step3; !(_step3 = _iterator3()).done;) {
          var t = _step3.value;
          if (!Number.isInteger(t) || t < 0 || t >= 34) throw Error('存檔有無效牌');
          c[t]++;
        }
        if (c.some(function (n) {
          return n !== 4;
        })) throw Error('牌張數量不符');
        if (s.phase === 'claim') {
          if (!s.lastDiscard || !s.claims.length) throw Error('回應狀態不完整');
          var expected = [0, 1, 2, 3].map(function (seat) {
            return {
              seat: seat,
              moves: reactionMoves(s, seat)
            };
          }).filter(function (c) {
            return c.moves.length;
          });
          if (expected.length !== s.claims.length || s.claims.some(function (c, i) {
            return c.seat !== expected[i].seat || JSON.stringify(c.moves) !== JSON.stringify(expected[i].moves) || c.choice && !c.moves.some(function (m) {
              return sameMove(m, c.choice);
            });
          })) throw Error('回應選項不符');
        }
        if (s.phase === 'ended' && (!s.outcome || s.outcome.delta.length !== 4 || s.outcome.delta.reduce(function (a, b) {
          return a + b;
        }, 0) !== 0)) throw Error('結算資料不完整');
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/game.ts", ['cc'], function () {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      cclegacy._RF.push({}, "bd4aeOeoVlKVaWGSgejFXxL", "game", undefined);
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/HandRow.ts", ['cc', './tiles.ts', './Painter.ts', './selectors2.ts', './VariantRegistry.ts', './TileCollection.ts', './Viewport.ts', './Typography.ts', './theme.ts', './Drawing.ts'], function (exports) {
  var cclegacy, Label, tileName, displayHand, canDiscard, presentationFor, TileCollection, uiScale, text, C, rect;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      Label = module.Label;
    }, function (module) {
      tileName = module.tileName;
    }, null, function (module) {
      displayHand = module.displayHand;
      canDiscard = module.canDiscard;
    }, function (module) {
      presentationFor = module.presentationFor;
    }, function (module) {
      TileCollection = module.TileCollection;
    }, function (module) {
      uiScale = module.uiScale;
    }, function (module) {
      text = module.text;
    }, function (module) {
      C = module.C;
    }, function (module) {
      rect = module.rect;
    }],
    execute: function () {
      cclegacy._RF.push({}, "d8d84JufMlIcrkVPI/gIRvL", "HandRow", undefined);
      var HandRowView = exports('HandRowView', /*#__PURE__*/function () {
        function HandRowView(parent, pool, actions) {
          this.tiles = void 0;
          this.badges = [];
          this.parent = parent;
          this.actions = actions;
          rect(parent, 640, 632, uiScale() < 0.8 ? 1230 : 1170, 111, '#112c23', 17, '#355444');
          this.tiles = new TileCollection(parent, pool, 'HandTiles');
        }
        var _proto = HandRowView.prototype;
        _proto.update = function update(state) {
          var _this = this;
          var game = state.game,
            hand = displayHand(game),
            canSelect = canDiscard(state);
          var width = uiScale() < 0.8 ? Math.min(84, 44 / uiScale()) : 70,
            spacing = width + 4;
          var drawGap = game.lastDraw !== undefined && game.current === game.viewerSeat && game.phase === 'discard' ? 12 : 0;
          var total = hand.length * spacing - 4 + drawGap,
            left = 640 - total / 2 + width / 2;
          var variant = presentationFor(game.ruleId);
          this.tiles.sync(hand.map(function (tile, index) {
            var x = left + index * spacing + (index === hand.length - 1 ? drawGap : 0);
            var badge = variant.tileBadge({
              tile: tile,
              isDrawn: index === hand.length - 1 && !!drawGap
            });
            var label = _this.badges[index];
            if (badge && !label) label = _this.badges[index] = text(_this.parent, '', x, 681, 12, C.gold, 50, 18).getComponent(Label);
            if (label) {
              label.node.active = !!badge;
              label.string = badge != null ? badge : '';
              label.node.setPosition(x, -681, 0);
            }
            return {
              key: "hand:" + index,
              tile: tile,
              x: x,
              y: 626 - (index === state.selected ? 16 : 0),
              width: width,
              height: 92,
              selected: index === state.selected,
              name: "hand:" + index + ":" + tileName(tile),
              onPress: canSelect ? function () {
                return _this.actions.selectTile(index);
              } : undefined
            };
          }));
          for (var i = hand.length; i < this.badges.length; i++) if (this.badges[i]) this.badges[i].node.active = false;
        };
        _proto.dispose = function dispose() {
          this.tiles.dispose();
        };
        return HandRowView;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/JsonCodec.ts", ['cc', './NetworkError.ts'], function (exports) {
  var cclegacy, NetworkError;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      NetworkError = module.NetworkError;
    }],
    execute: function () {
      exports('isObject', isObject);
      cclegacy._RF.push({}, "3ef9biaWwJDu6zvWbSTxc8m", "JsonCodec", undefined);
      var MAX_MESSAGE_BYTES = exports('MAX_MESSAGE_BYTES', 256 * 1024);
      function isObject(value) {
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      }
      var text = function text(value, max) {
        return typeof value === 'string' && value.length > 0 && value.length <= max;
      };

      /** JSON text only; reject incompatible versions and malformed envelopes at the boundary. */
      var JsonCodec = exports('JsonCodec', /*#__PURE__*/function () {
        function JsonCodec() {}
        var _proto = JsonCodec.prototype;
        _proto.encode = function encode(message) {
          var raw = JSON.stringify(message);
          if (new TextEncoder().encode(raw).length > MAX_MESSAGE_BYTES) throw new NetworkError('MESSAGE_SIZE', '訊息過大');
          return raw;
        };
        _proto.decode = function decode(raw) {
          var fail = function fail() {
            return new NetworkError('PROTOCOL', '伺服器訊息格式不相容，請重新連線');
          };
          if (typeof raw !== 'string' || raw.length > MAX_MESSAGE_BYTES || new TextEncoder().encode(raw).length > MAX_MESSAGE_BYTES) throw fail();
          var m;
          try {
            m = JSON.parse(raw);
          } catch (_unused) {
            throw fail();
          }
          if (!isObject(m) || m.v !== 1) throw fail();
          if (m.kind === 'request' && text(m.id, 128) && text(m.method, 80) && 'payload' in m) return m;
          if (m.kind === 'event' && text(m.method, 80) && 'payload' in m) return m;
          if (m.kind === 'response' && text(m.id, 128)) {
            if (m.ok === true && 'payload' in m) return m;
            if (m.ok === false && isObject(m.error) && text(m.error.code, 80) && text(m.error.message, 1000)) return m;
          }
          throw fail();
        };
        return JsonCodec;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/KeyboardInput.ts", ['cc', './selectors.ts', './selectors2.ts'], function (exports) {
  var cclegacy, input, Input, KeyCode, canDiscard, displayHand;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      input = module.input;
      Input = module.Input;
      KeyCode = module.KeyCode;
    }, null, function (module) {
      canDiscard = module.canDiscard;
      displayHand = module.displayHand;
    }],
    execute: function () {
      cclegacy._RF.push({}, "726eammDZ1HopPLLmmWJQvW", "KeyboardInput", undefined);
      var KeyboardInput = exports('KeyboardInput', /*#__PURE__*/function () {
        function KeyboardInput(state, dispatch) {
          this.state = state;
          this.dispatch = dispatch;
          input.on(Input.EventType.KEY_DOWN, this.onKey, this);
        }
        var _proto = KeyboardInput.prototype;
        _proto.dispose = function dispose() {
          input.off(Input.EventType.KEY_DOWN, this.onKey, this);
        };
        _proto.onKey = function onKey(event) {
          var state = this.state(),
            key = event.keyCode;
          if (key === KeyCode.ESCAPE) {
            if (state.modal && state.modal !== 'result') this.dispatch({
              type: 'modal',
              modal: null
            });else if (state.screen === 'table' && !state.modal) this.dispatch({
              type: 'modal',
              modal: 'leave'
            });
            return;
          }
          if (state.modal || state.busy) return;
          if (state.screen === 'lobby') {
            if (key === KeyCode.ENTER) this.dispatch({
              type: state.resumable ? 'resume' : 'start'
            });
            return;
          }
          if (!state.game) return;
          if (canDiscard(state)) {
            var hand = displayHand(state.game);
            if (key === KeyCode.ARROW_LEFT || key === KeyCode.ARROW_RIGHT) {
              var index = (state.selected + (key === KeyCode.ARROW_LEFT ? -1 : 1) + hand.length) % hand.length;
              this.dispatch({
                type: 'select-tile',
                index: index
              });
            }
            if (key === KeyCode.ENTER) this.dispatch({
              type: 'confirm-discard'
            });
          }
          var type = key === KeyCode.KEY_H ? 'win' : key === KeyCode.KEY_P ? 'pon' : key === KeyCode.KEY_K ? 'kong' : key === KeyCode.KEY_C ? 'chi' : key === KeyCode.SPACE ? 'pass' : null;
          var move = state.game.legalMoves.find(function (m) {
            return m.type === type;
          });
          if (move) this.dispatch({
            type: 'move',
            move: move
          });
        };
        return KeyboardInput;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/LeaveDialog.ts", ['cc', './Painter.ts', './Typography.ts', './theme.ts', './Button.ts'], function (exports) {
  var cclegacy, text, C, button;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, null, function (module) {
      text = module.text;
    }, function (module) {
      C = module.C;
    }, function (module) {
      button = module.button;
    }],
    execute: function () {
      exports('renderLeave', renderLeave);
      cclegacy._RF.push({}, "9318aAgosxP/YTNjPe7D9n+", "LeaveDialog", undefined);
      function renderLeave(parent, state, actions) {
        var replacing = state.screen === 'lobby';
        text(parent, replacing ? '另開一局？' : '先休息一下', 640, 237, 36, C.ivory, 700, 64, 'center', true);
        text(parent, replacing ? '新對局會取代尚未完成的牌局。' : '返回大廳後，可從「繼續上次對局」回到牌桌。', 640, 342, 23, C.muted, 730, 95);
        button(parent, '繼續這一局', 470, 490, 250, 62, function () {
          return actions.openModal(null);
        });
        button(parent, replacing ? '開始新局' : '返回大廳', 800, 490, 250, 62, actions.confirmLeave, true, !state.busy);
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/LobbyView.ts", ['cc', './Brand.ts', './Painter.ts', './VariantRegistry.ts', './TileCollection.ts', './Typography.ts', './theme.ts', './Drawing.ts', './Button.ts'], function (exports) {
  var cclegacy, drawBrand, presentationFor, TileCollection, text, C, line, node, circle, button;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      drawBrand = module.drawBrand;
    }, null, function (module) {
      presentationFor = module.presentationFor;
    }, function (module) {
      TileCollection = module.TileCollection;
    }, function (module) {
      text = module.text;
    }, function (module) {
      C = module.C;
    }, function (module) {
      line = module.line;
      node = module.node;
      circle = module.circle;
    }, function (module) {
      button = module.button;
    }],
    execute: function () {
      exports('renderLobby', renderLobby);
      cclegacy._RF.push({}, "4cef2bpgj9A4qa/P/3GO7lt", "LobbyView", undefined);
      function renderLobby(p, state, actions, pool) {
        var variant = presentationFor(state.selectedRuleId);
        drawBrand(p);
        text(p, variant.config.tableLabel + " / " + variant.config.title, 1080, 43, 17, C.muted, 290, 30, 'right');
        line(p, 44, 78, 1236, 78);
        text(p, '一桌好牌，一刻自在。', 250, 160, 20, C.gold, 360, 40, 'left', true);
        text(p, '青竹', 259, 262, 106, C.ivory, 380, 136, 'left', true);
        text(p, '麻將', 259, 378, 106, C.ivory, 380, 136, 'left', true);
        line(p, 74, 463, 120, 463, C.gold, 2);
        text(p, '四席就緒，隨時開局。', 300, 463, 21, C.muted, 310, 38, 'left');
        var resume = !!state.resumable;
        button(p, state.busy ? '正在安排牌桌…' : resume ? '繼續上次對局  →' : '開始對局  →', 260, 548, 376, 66, function () {
          return resume ? actions.resume() : void actions.start();
        }, true, !state.busy);
        if (resume) button(p, '另開新局', 550, 548, 150, 66, function () {
          return actions.requestNew();
        }, false, !state.busy);
        button(p, '玩法說明', 152, 627, 158, 50, function () {
          return actions.openModal('rules');
        });
        button(p, '對局紀錄', 335, 627, 158, 50, function () {
          return actions.openModal('records');
        });
        var art = node(p, '牌面展示', 880, 346, 480, 450);
        circle(art, 0, 0, 236, '#162f27', '#395345');
        circle(art, 0, 0, 214, '#18352c', '#29483b');
        for (var a = 0; a < 12; a++) {
          var angle = a * Math.PI / 6;
          circle(art, Math.cos(angle) * 225, Math.sin(angle) * 225, 2, C.gold);
        }
        var tiles = new TileCollection(art, pool, 'LobbyTiles');
        tiles.sync([{
          key: 'lobby:wan',
          tile: 0,
          x: -107,
          y: 30,
          width: 123,
          height: 172,
          angle: 17
        }, {
          key: 'lobby:bamboo',
          tile: 18,
          x: 16,
          y: -5,
          width: 123,
          height: 172,
          angle: -7
        }, {
          key: 'lobby:variant',
          tile: variant.config.iconTile,
          x: 118,
          y: 72,
          width: 123,
          height: 172,
          angle: -20
        }]);
        text(art, '清 風 入 席', 0, -165, 19, C.gold, 300, 36, 'center', true);
        text(art, '一人入座  ·  三位牌友', 0, 181, 17, C.muted, 300, 30);
        text(p, '單機練習  ·  示範計分', 1044, 662, 16, C.muted, 370, 28, 'right');
        return tiles;
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/main", ['./AppController.ts', './AppEntry.ts', './AppFlowMachine.ts', './AppRenderer.ts', './AppState.ts', './KeyboardInput.ts', './ViewActions2.ts', './createServices.ts', './selectors.ts', './LeaveDialog.ts', './ModalLayer.ts', './services.ts', './storage2.ts', './LobbyView.ts', './TableController.ts', './TableState.ts', './selectors2.ts', './Simplified13Presentation.ts', './VariantPresentation.ts', './VariantRegistry.ts', './TableView.ts', './ViewActions.ts', './ActionBar.ts', './HandRow.ts', './MeldGroup.ts', './OpponentHands.ts', './PlayerSeat.ts', './River.ts', './TileCollection.ts', './TilePool.ts', './TileSpec.ts', './TileView.ts', './ResultDialog.ts', './RulesDialog.ts', './RecordsView.ts', './MockMatchmaking.ts', './MockRecordStore.ts', './MockGameSession.ts', './SnapshotProjection.ts', './bot.ts', './engine.ts', './model.ts', './rules.ts', './storage.ts', './JsonCodec.ts', './NetworkError.ts', './PendingRequests.ts', './WebSocketTransport.ts', './WsClient.ts', './ResumeTicketStore.ts', './WsGameSession.ts', './WsMatchmaking.ts', './WsRecordService.ts', './validation.ts', './game.ts', './wire.ts', './clone.ts', './ConnectionMachine.ts', './tiles.ts', './Bamboo.ts', './Brand.ts', './Button.ts', './Drawing.ts', './Painter.ts', './RetainedButton.ts', './Typography.ts', './Viewport.ts', './theme.ts'], function () {
  return {
    setters: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    execute: function () {}
  };
});

System.register("chunks:///_virtual/MeldGroup.ts", ['cc'], function (exports) {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      exports('meldTiles', meldTiles);
      cclegacy._RF.push({}, "8887dBs2GJLrL2Tktppztha", "MeldGroup", undefined);
      function meldTiles(game, seat, x, y, w, vertical) {
        if (vertical === void 0) {
          vertical = false;
        }
        return game.players[seat].melds.flatMap(function (meld, m) {
          return meld.tiles.map(function (tile, i) {
            return {
              key: "meld:" + seat + ":" + m + ":" + i,
              tile: tile,
              x: x + (vertical ? 0 : m * (w * 4 + 14)) + i * (w + 2),
              y: y + (vertical ? m * 34 : 0),
              width: w,
              height: w * 1.35,
              back: tile < 0
            };
          });
        });
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/MockGameSession.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './clone.ts', './storage.ts', './bot.ts', './engine.ts', './SnapshotProjection.ts'], function (exports) {
  var _createForOfIteratorHelperLoose, _asyncToGenerator, _regeneratorRuntime, cclegacy, clone, readSaved, SAVE, botMove, applyMove, newGame, project;
  return {
    setters: [function (module) {
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
      _asyncToGenerator = module.asyncToGenerator;
      _regeneratorRuntime = module.regeneratorRuntime;
    }, function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      clone = module.clone;
    }, function (module) {
      readSaved = module.readSaved;
      SAVE = module.SAVE;
    }, function (module) {
      botMove = module.botMove;
    }, function (module) {
      applyMove = module.applyMove;
      newGame = module.newGame;
    }, function (module) {
      project = module.project;
    }],
    execute: function () {
      cclegacy._RF.push({}, "6a6a7Cj169CqK+glpL62rUG", "MockGameSession", undefined);
      var MockGameSession = exports('MockGameSession', /*#__PURE__*/function () {
        function MockGameSession(storage, records, delay) {
          if (delay === void 0) {
            delay = 650;
          }
          this.state = null;
          this.listeners = new Set();
          this.processed = new Set();
          this.timer = null;
          this.paused = true;
          this.foreground = true;
          this.presentationActive = true;
          this.storage = storage;
          this.records = records;
          this.delay = delay;
        }
        var _proto = MockGameSession.prototype;
        _proto.getSnapshot = function getSnapshot() {
          return this.state ? project(this.state) : null;
        };
        _proto.connect = /*#__PURE__*/function () {
          var _connect = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(ticket) {
            var saved;
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  if (!(ticket.transport !== 'local')) {
                    _context.next = 2;
                    break;
                  }
                  throw Error('本機服務無法連接這個牌桌');
                case 2:
                  saved = readSaved(this.storage);
                  this.stopTimer();
                  this.state = (saved == null ? void 0 : saved.id) === ticket.sessionId ? saved : newGame(Math.random, ticket.sessionId);
                  this.processed.clear();
                  this.paused = false;
                  this.emit({
                    type: 'connection',
                    status: 'connected'
                  });
                  _context.next = 10;
                  return this.publish();
                case 10:
                case "end":
                  return _context.stop();
              }
            }, _callee, this);
          }));
          function connect(_x) {
            return _connect.apply(this, arguments);
          }
          return connect;
        }();
        _proto.subscribe = function subscribe(listener) {
          var _this = this;
          this.listeners.add(listener);
          if (this.state) listener({
            type: 'snapshot',
            snapshot: project(this.state)
          });
          return function () {
            return _this.listeners["delete"](listener);
          };
        };
        _proto.send = /*#__PURE__*/function () {
          var _send = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(command) {
            return _regeneratorRuntime().wrap(function _callee2$(_context2) {
              while (1) switch (_context2.prev = _context2.next) {
                case 0:
                  if (this.state) {
                    _context2.next = 2;
                    break;
                  }
                  throw Error('請先開始對局');
                case 2:
                  if (!this.paused) {
                    _context2.next = 4;
                    break;
                  }
                  throw Error('對局暫停中');
                case 4:
                  if (!this.processed.has(command.requestId)) {
                    _context2.next = 6;
                    break;
                  }
                  return _context2.abrupt("return");
                case 6:
                  if (!(command.expectedRevision !== this.state.revision)) {
                    _context2.next = 8;
                    break;
                  }
                  throw Error('牌桌已更新，請重新操作');
                case 8:
                  this.state = applyMove(this.state, 0, command.move);
                  this.processed.add(command.requestId);
                  if (this.processed.size > 256) this.processed["delete"](this.processed.values().next().value);
                  _context2.next = 13;
                  return this.publish();
                case 13:
                case "end":
                  return _context2.stop();
              }
            }, _callee2, this);
          }));
          function send(_x2) {
            return _send.apply(this, arguments);
          }
          return send;
        }();
        _proto.setForeground = function setForeground(active) {
          this.foreground = active;
          this.updatePause();
        };
        _proto.setPresentationActive = function setPresentationActive(active) {
          this.presentationActive = active;
          this.updatePause();
        };
        _proto.updatePause = function updatePause() {
          var paused = !this.foreground || !this.presentationActive;
          if (paused === this.paused) return;
          this.paused = paused;
          this.stopTimer();
          if (!paused) this.schedule();
        };
        _proto.dispose = function dispose() {
          this.paused = true;
          this.stopTimer();
          this.listeners.clear();
        };
        _proto.stopTimer = function stopTimer() {
          if (this.timer !== null) clearTimeout(this.timer);
          this.timer = null;
        };
        _proto.publish = /*#__PURE__*/function () {
          var _publish = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3() {
            var s, o, p, snapshot;
            return _regeneratorRuntime().wrap(function _callee3$(_context3) {
              while (1) switch (_context3.prev = _context3.next) {
                case 0:
                  s = this.state;
                  _context3.prev = 1;
                  if (!(s.phase === 'ended')) {
                    _context3.next = 9;
                    break;
                  }
                  o = s.outcome, p = o.winner !== undefined ? s.players[o.winner] : null;
                  _context3.next = 6;
                  return this.records.save({
                    viewerSeat: 0,
                    id: s.id,
                    ruleId: s.ruleId,
                    startedAt: s.createdAt,
                    endedAt: s.updatedAt,
                    names: s.players.map(function (p) {
                      return p.name;
                    }),
                    outcome: clone(o),
                    winnerHand: p ? [].concat(p.hand, o.kind === 'discardWin' ? [o.tile] : []).sort(function (a, b) {
                      return a - b;
                    }) : [],
                    winnerMelds: p ? clone(p.melds) : []
                  });
                case 6:
                  this.storage.removeItem(SAVE);
                  _context3.next = 10;
                  break;
                case 9:
                  this.storage.setItem(SAVE, JSON.stringify(s));
                case 10:
                  _context3.next = 15;
                  break;
                case 12:
                  _context3.prev = 12;
                  _context3.t0 = _context3["catch"](1);
                  this.emit({
                    type: 'notice',
                    message: '瀏覽器無法儲存資料，本局可繼續遊玩，但重新整理後可能遺失。'
                  });
                case 15:
                  snapshot = project(s);
                  this.emit({
                    type: 'snapshot',
                    snapshot: snapshot
                  });
                  this.schedule();
                case 18:
                case "end":
                  return _context3.stop();
              }
            }, _callee3, this, [[1, 12]]);
          }));
          function publish() {
            return _publish.apply(this, arguments);
          }
          return publish;
        }();
        _proto.emit = function emit(event) {
          for (var _iterator = _createForOfIteratorHelperLoose(this.listeners), _step; !(_step = _iterator()).done;) {
            var listener = _step.value;
            listener(clone(event));
          }
        };
        _proto.schedule = function schedule() {
          var _s$claims$find$seat,
            _s$claims$find,
            _this2 = this;
          this.stopTimer();
          if (this.paused || !this.state || this.state.phase === 'ended') return;
          var s = this.state;
          var seat = s.phase === 'discard' ? s.current !== 0 ? s.current : null : (_s$claims$find$seat = (_s$claims$find = s.claims.find(function (c) {
            return c.seat !== 0 && !c.choice;
          })) == null ? void 0 : _s$claims$find.seat) != null ? _s$claims$find$seat : null;
          if (seat === null) return;
          this.timer = setTimeout(function () {
            _this2.timer = null;
            if (!_this2.state || _this2.paused) return;
            var move = botMove(_this2.state, seat);
            if (move) {
              _this2.state = applyMove(_this2.state, seat, move);
              _this2.publish();
            }
          }, this.delay);
        };
        return MockGameSession;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/MockMatchmaking.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './storage.ts'], function (exports) {
  var _asyncToGenerator, _regeneratorRuntime, cclegacy, readSaved;
  return {
    setters: [function (module) {
      _asyncToGenerator = module.asyncToGenerator;
      _regeneratorRuntime = module.regeneratorRuntime;
    }, function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      readSaved = module.readSaved;
    }],
    execute: function () {
      cclegacy._RF.push({}, "5da8baHqfVNF68FLJZI4oUq", "MockMatchmaking", undefined);
      var MockMatchmaking = exports('MockMatchmaking', /*#__PURE__*/function () {
        function MockMatchmaking(storage) {
          this.storage = storage;
        }
        var _proto = MockMatchmaking.prototype;
        _proto.findResumable = /*#__PURE__*/function () {
          var _findResumable = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
            var s;
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  s = readSaved(this.storage);
                  return _context.abrupt("return", s ? {
                    id: 'resume-' + s.id,
                    sessionId: s.id,
                    seat: 0,
                    transport: 'local'
                  } : null);
                case 2:
                case "end":
                  return _context.stop();
              }
            }, _callee, this);
          }));
          function findResumable() {
            return _findResumable.apply(this, arguments);
          }
          return findResumable;
        }();
        _proto.match = /*#__PURE__*/function () {
          var _match = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(request, signal) {
            var id;
            return _regeneratorRuntime().wrap(function _callee2$(_context2) {
              while (1) switch (_context2.prev = _context2.next) {
                case 0:
                  if (!(request.mode !== 'practice' || request.ruleId !== 'demo-13-v1')) {
                    _context2.next = 2;
                    break;
                  }
                  throw Error('目前提供簡化 13 張練習對局');
                case 2:
                  _context2.next = 4;
                  return new Promise(function (resolve, reject) {
                    if (signal != null && signal.aborted) {
                      reject(Error('配桌已取消'));
                      return;
                    }
                    var abort = function abort() {
                      clearTimeout(timer);
                      reject(Error('配桌已取消'));
                    };
                    var timer = setTimeout(function () {
                      signal == null || signal.removeEventListener('abort', abort);
                      resolve();
                    }, 650);
                    signal == null || signal.addEventListener('abort', abort, {
                      once: true
                    });
                  });
                case 4:
                  id = "local-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
                  return _context2.abrupt("return", {
                    id: "match-" + id,
                    sessionId: id,
                    seat: 0,
                    transport: 'local'
                  });
                case 6:
                case "end":
                  return _context2.stop();
              }
            }, _callee2);
          }));
          function match(_x, _x2) {
            return _match.apply(this, arguments);
          }
          return match;
        }();
        return MockMatchmaking;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/MockRecordStore.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './storage.ts'], function (exports) {
  var _asyncToGenerator, _regeneratorRuntime, cclegacy, RECORDS;
  return {
    setters: [function (module) {
      _asyncToGenerator = module.asyncToGenerator;
      _regeneratorRuntime = module.regeneratorRuntime;
    }, function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      RECORDS = module.RECORDS;
    }],
    execute: function () {
      cclegacy._RF.push({}, "477a1oIznZFIaEj2s69J2Bl", "MockRecordStore", undefined);
      var MockRecordStore = exports('MockRecordStore', /*#__PURE__*/function () {
        function MockRecordStore(storage) {
          this.storage = storage;
        }
        var _proto = MockRecordStore.prototype;
        _proto.read = function read() {
          try {
            var data = JSON.parse(this.storage.getItem(RECORDS) || '[]');
            return Array.isArray(data) ? data.filter(function (r) {
              return r && typeof r.id === 'string' && r.outcome && Array.isArray(r.outcome.delta) && r.outcome.delta.length === 4 && typeof r.endedAt === 'string';
            }).slice(0, 30) : [];
          } catch (_unused) {
            return [];
          }
        };
        _proto.list = /*#__PURE__*/function () {
          var _list = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  return _context.abrupt("return", this.read());
                case 1:
                case "end":
                  return _context.stop();
              }
            }, _callee, this);
          }));
          function list() {
            return _list.apply(this, arguments);
          }
          return list;
        }();
        _proto.save = /*#__PURE__*/function () {
          var _save = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(record) {
            var rows;
            return _regeneratorRuntime().wrap(function _callee2$(_context2) {
              while (1) switch (_context2.prev = _context2.next) {
                case 0:
                  rows = this.read();
                  if (!rows.some(function (r) {
                    return r.id === record.id;
                  })) {
                    _context2.next = 3;
                    break;
                  }
                  return _context2.abrupt("return");
                case 3:
                  this.storage.setItem(RECORDS, JSON.stringify([record].concat(rows).slice(0, 30)));
                case 4:
                case "end":
                  return _context2.stop();
              }
            }, _callee2, this);
          }));
          function save(_x) {
            return _save.apply(this, arguments);
          }
          return save;
        }();
        return MockRecordStore;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/ModalLayer.ts", ['cc', './ResultDialog.ts', './RulesDialog.ts', './RecordsView.ts', './Painter.ts', './LeaveDialog.ts', './Drawing.ts', './Button.ts'], function (exports) {
  var cclegacy, Node, renderResult, renderRules, renderHistory, renderLeave, rect, button;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      Node = module.Node;
    }, function (module) {
      renderResult = module.renderResult;
    }, function (module) {
      renderRules = module.renderRules;
    }, function (module) {
      renderHistory = module.renderHistory;
    }, null, function (module) {
      renderLeave = module.renderLeave;
    }, function (module) {
      rect = module.rect;
    }, function (module) {
      button = module.button;
    }],
    execute: function () {
      exports('renderModal', renderModal);
      cclegacy._RF.push({}, "c7a6d+7bUhKZbJXPo/YPAwo", "ModalLayer", undefined);
      function renderModal(parent, state, actions, pool) {
        var _state$game$ruleId, _state$game, _state$game2;
        if (!state.modal) return;
        var shade = rect(parent, 640, 360, 1280, 720, '#08160fdc');
        shade.on(Node.EventType.TOUCH_END, function (event) {
          event.propagationStopped = true;
        });
        rect(parent, 640, 360, 900, 598, '#1b382c', 22, '#647556');
        if (state.modal !== 'result') button(parent, '關閉', 1026, 110, 90, 44, function () {
          return actions.openModal(null);
        });
        switch (state.modal) {
          case 'rules':
            renderRules(parent, (_state$game$ruleId = (_state$game = state.game) == null ? void 0 : _state$game.ruleId) != null ? _state$game$ruleId : state.selectedRuleId);
            break;
          case 'records':
            renderHistory(parent, state, actions);
            break;
          case 'result':
            if ((_state$game2 = state.game) != null && _state$game2.outcome) return renderResult(parent, state, actions, pool);
            break;
          case 'leave':
            renderLeave(parent, state, actions);
        }
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/model.ts", ['cc', './game.ts', './clone.ts', './tiles.ts'], function (exports) {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, null, function (module) {
      exports('clone', module.clone);
    }, function (module) {
      exports('tileName', module.tileName);
    }],
    execute: function () {
      cclegacy._RF.push({}, "38ce3Y9yQlDx4h6Xm5y8jB3", "model", undefined);
      var NAMES = exports('NAMES', ['你', '小竹', '阿松', '小梅']);
      var seatNext = exports('seatNext', function seatNext(seat) {
        return (seat + 1) % 4;
      });
      var sameMove = exports('sameMove', function sameMove(a, b) {
        return JSON.stringify(a) === JSON.stringify(b);
      });
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/NetworkError.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _inheritsLoose, _wrapNativeSuper, cclegacy;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
      _wrapNativeSuper = module.wrapNativeSuper;
    }, function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      cclegacy._RF.push({}, "e60a5pdQ1NE6KJ6WochZSZP", "NetworkError", undefined);
      var NetworkError = exports('NetworkError', /*#__PURE__*/function (_Error) {
        _inheritsLoose(NetworkError, _Error);
        function NetworkError(code, message) {
          var _this;
          _this = _Error.call(this, message) || this;
          _this.code = code;
          _this.name = 'NetworkError';
          return _this;
        }
        return NetworkError;
      }( /*#__PURE__*/_wrapNativeSuper(Error)));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/OpponentHands.ts", ['cc', './selectors2.ts'], function (exports) {
  var cclegacy, relativeSeat;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      relativeSeat = module.relativeSeat;
    }],
    execute: function () {
      exports('opponentTiles', opponentTiles);
      cclegacy._RF.push({}, "13e492nzt1CTKUOZKfVBCln", "OpponentHands", undefined);
      function opponentTiles(game) {
        var reveal = game.phase === 'ended',
          specs = [];
        for (var _i = 0, _arr = [2, 1, 3]; _i < _arr.length; _i++) {
          var offset = _arr[_i];
          var player = game.players[relativeSeat(game, offset)];
          var width = offset === 2 ? player.handCount > 11 ? 23 : 25 : 22;
          for (var i = 0; i < player.handCount; i++) {
            var _player$hand$i, _player$hand;
            specs.push({
              key: "opponent:" + player.seat + ":" + i,
              tile: reveal ? (_player$hand$i = (_player$hand = player.hand) == null ? void 0 : _player$hand[i]) != null ? _player$hand$i : -1 : -1,
              x: offset === 2 ? 640 + (i - (player.handCount - 1) / 2) * (width + 3) : offset === 1 ? 1035 : 245,
              y: offset === 2 ? 179 : 229 + i * 18,
              width: width,
              height: offset === 2 ? 34 : 29,
              back: !reveal
            });
          }
        }
        return specs;
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/Painter.ts", ['cc', './Button.ts', './Drawing.ts', './theme.ts', './Typography.ts', './Viewport.ts'], function (exports) {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      exports('button', module.button);
    }, function (module) {
      var _setter = {};
      _setter.circle = module.circle;
      _setter.line = module.line;
      _setter.node = module.node;
      _setter.rect = module.rect;
      exports(_setter);
    }, function (module) {
      var _setter = {};
      _setter.C = module.C;
      _setter.col = module.col;
      exports(_setter);
    }, function (module) {
      exports('text', module.text);
    }, function (module) {
      exports('uiScale', module.uiScale);
    }],
    execute: function () {
      cclegacy._RF.push({}, "fd242NSANZbJ7oq0Br2KD9F", "Painter", undefined);
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/PendingRequests.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './NetworkError.ts'], function (exports) {
  var _createClass, cclegacy, NetworkError;
  return {
    setters: [function (module) {
      _createClass = module.createClass;
    }, function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      NetworkError = module.NetworkError;
    }],
    execute: function () {
      cclegacy._RF.push({}, "05d6a6pFNhFXZjCGhXF5JBs", "PendingRequests", undefined);
      /** Requests are never queued or automatically replayed after a connection loss. */
      var PendingRequests = exports('PendingRequests', /*#__PURE__*/function () {
        function PendingRequests() {
          this.entries = new Map();
        }
        var _proto = PendingRequests.prototype;
        _proto.add = function add(id, timeoutMs, signal) {
          var _this = this;
          if (this.entries.has(id)) throw new NetworkError('DUPLICATE_REQUEST', '請求編號重複');
          if (this.entries.size >= 64) throw new NetworkError('BUSY', '連線忙碌中，請稍後再試');
          if (signal != null && signal.aborted) throw new NetworkError('ABORTED', '操作已取消');
          return new Promise(function (resolve, reject) {
            var abort = function abort() {
              return _this.reject(id, new NetworkError('ABORTED', '操作已取消'));
            };
            var timer = setTimeout(function () {
              _this.reject(id, new NetworkError('TIMEOUT', '伺服器回覆逾時，正在確認最新狀態'));
            }, timeoutMs);
            _this.entries.set(id, {
              resolve: resolve,
              reject: reject,
              cleanup: function cleanup() {
                clearTimeout(timer);
                signal == null || signal.removeEventListener('abort', abort);
              }
            });
            signal == null || signal.addEventListener('abort', abort, {
              once: true
            });
          });
        };
        _proto.resolve = function resolve(id, value) {
          var _this$take;
          (_this$take = this.take(id)) == null || _this$take.resolve(value);
        };
        _proto.reject = function reject(id, error) {
          var _this$take2;
          (_this$take2 = this.take(id)) == null || _this$take2.reject(error);
        };
        _proto.rejectAll = function rejectAll(error) {
          for (var _i = 0, _Array$from = Array.from(this.entries.keys()); _i < _Array$from.length; _i++) {
            var id = _Array$from[_i];
            this.reject(id, error);
          }
        };
        _proto.take = function take(id) {
          var pending = this.entries.get(id);
          if (pending) {
            this.entries["delete"](id);
            pending.cleanup();
          }
          return pending;
        };
        _createClass(PendingRequests, [{
          key: "size",
          get: function get() {
            return this.entries.size;
          }
        }]);
        return PendingRequests;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/PlayerSeat.ts", ['cc', './Painter.ts', './Drawing.ts', './theme.ts', './Typography.ts'], function (exports) {
  var cclegacy, circle, C, text;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, null, function (module) {
      circle = module.circle;
    }, function (module) {
      C = module.C;
    }, function (module) {
      text = module.text;
    }],
    execute: function () {
      exports('renderPlayer', renderPlayer);
      cclegacy._RF.push({}, "dddbbx+rPtDkbpM1Gq/hl/2", "PlayerSeat", undefined);
      function renderPlayer(p, game, seat, x, y, top) {
        if (top === void 0) {
          top = false;
        }
        var s = game,
          pl = s.players[seat],
          active = s.current === seat && s.phase === 'discard',
          glyph = ['東', '南', '西', '北'][seat];
        circle(p, x, y, 26, active ? '#a78c58' : '#365c48', active ? C.gold : '#5e7862');
        text(p, glyph, x, y, 27, active ? C.bg : C.ivory, 45, 48, 'center', true);
        if (top) {
          text(p, pl.name, x - 86, y, 18, C.ivory, 80, 32);
          text(p, active ? '思考中…' : pl.isBot ? '電腦牌友' : '牌友', x + 111, y, 14, active ? C.gold : C.muted, 120, 28);
        } else {
          text(p, pl.name, x, y + 45, 18, C.ivory, 120, 28);
          text(p, active ? '思考中…' : pl.isBot ? '電腦牌友' : '牌友', x, y + 73, 13, active ? C.gold : C.muted, 130, 26);
        }
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/RecordsView.ts", ['cc', './Painter.ts', './Typography.ts', './theme.ts', './Drawing.ts', './Button.ts'], function (exports) {
  var cclegacy, text, C, line, button;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, null, function (module) {
      text = module.text;
    }, function (module) {
      C = module.C;
    }, function (module) {
      line = module.line;
    }, function (module) {
      button = module.button;
    }],
    execute: function () {
      exports('renderHistory', renderHistory);
      cclegacy._RF.push({}, "0f46av39cFITbnp7oILCm2B", "RecordsView", undefined);
      function renderHistory(p, state, actions) {
        text(p, '對局紀錄', 640, 122, 34, C.ivory, 600, 58, 'center', true);
        text(p, '最近 30 局 · 保存在此瀏覽器', 640, 172, 17, C.muted, 650, 32);
        if (state.loadingRecords) {
          text(p, '正在讀取紀錄…', 640, 350, 23, C.muted, 600, 50);
          return;
        }
        var all = state.records,
          rows = all.slice(state.recordPage * 5, state.recordPage * 5 + 5);
        if (!all.length) {
          text(p, '第一場好局，等你開打。', 640, 346, 28, C.ivory, 700, 60, 'center', true);
          text(p, '完成對局後，結果會出現在這裡。', 640, 401, 19, C.muted, 700, 40);
          return;
        }
        rows.forEach(function (r, i) {
          var _r$viewerSeat;
          var y = 243 + i * 67;
          var date = new Date(r.endedAt);
          text(p, date.getMonth() + 1 + "/" + date.getDate() + "  " + String(date.getHours()).padStart(2, '0') + ":" + String(date.getMinutes()).padStart(2, '0'), 334, y, 20, C.muted, 170, 45, 'left');
          text(p, r.outcome.kind === 'draw' ? '流局' : "" + r.names[r.outcome.winner] + (r.outcome.kind === 'selfDraw' ? '自摸' : '胡牌'), 593, y, 23, C.ivory, 330, 45, 'left');
          var d = r.outcome.delta[(_r$viewerSeat = r.viewerSeat) != null ? _r$viewerSeat : 0];
          text(p, "" + (d > 0 ? '+' : '') + d + " \u5206", 897, y, 24, d > 0 ? C.gold : C.ivory, 180, 45, 'right');
          line(p, 245, y + 33, 1040, y + 33);
        });
        button(p, '上一頁', 401, 608, 160, 44, function () {
          actions.recordsPage(state.recordPage - 1);
        }, false, state.recordPage > 0);
        text(p, state.recordPage + 1 + " / " + Math.ceil(all.length / 5), 640, 608, 18, C.muted, 140, 40);
        button(p, '下一頁', 879, 608, 160, 44, function () {
          actions.recordsPage(state.recordPage + 1);
        }, false, (state.recordPage + 1) * 5 < all.length);
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/ResultDialog.ts", ['cc', './Painter.ts', './VariantRegistry.ts', './TileCollection.ts', './Typography.ts', './theme.ts', './Button.ts'], function (exports) {
  var cclegacy, presentationFor, TileCollection, text, C, button;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, null, function (module) {
      presentationFor = module.presentationFor;
    }, function (module) {
      TileCollection = module.TileCollection;
    }, function (module) {
      text = module.text;
    }, function (module) {
      C = module.C;
    }, function (module) {
      button = module.button;
    }],
    execute: function () {
      exports('renderResult', renderResult);
      cclegacy._RF.push({}, "f3ee5XtP0pLGID1SrapVnIo", "ResultDialog", undefined);
      function renderResult(p, state, actions, pool) {
        var s = state.game,
          o = s.outcome,
          winner = o.winner;
        text(p, presentationFor(s.ruleId).resultTitle(s), 640, 135, 40, C.gold, 740, 72, 'center', true);
        text(p, "\u672C\u5C40\u7D50\u7B97 / " + presentationFor(s.ruleId).config.title, 640, 192, 18, C.muted, 700, 36);
        var specs = [];
        if (winner !== undefined) {
          var pl = s.players[winner],
            hand = [].concat(pl.hand || [], o.kind === 'discardWin' ? [o.tile] : []).sort(function (a, b) {
              return a - b;
            });
          var width = 39;
          for (var i = 0; i < hand.length; i++) specs.push({
            key: "result:hand:" + i,
            tile: hand[i],
            x: 640 + (i - (hand.length - 1) / 2) * (width + 4),
            y: 258,
            width: width,
            height: 55
          });
          var allMeldTiles = pl.melds.flatMap(function (m) {
            return m.tiles;
          });
          for (var _i = 0; _i < allMeldTiles.length; _i++) specs.push({
            key: "result:meld:" + _i,
            tile: allMeldTiles[_i],
            x: 640 + (_i - (allMeldTiles.length - 1) / 2) * 25,
            y: 316,
            width: 22,
            height: 30
          });
        } else text(p, '牌山已盡，下一局再見分曉。', 640, 272, 23, C.ivory, 700, 60);
        for (var _i2 = 0; _i2 < 4; _i2++) {
          var x = 370 + _i2 * 180,
            d = o.delta[_i2];
          text(p, s.players[_i2].name, x, 387, 21, C.ivory, 150, 40);
          text(p, "" + (d > 0 ? '+' : '') + d, x, 444, 44, d > 0 ? C.gold : C.muted, 150, 65);
        }
        button(p, '返回大廳', 470, 558, 250, 64, actions.confirmLeave);
        button(p, '再玩一局  →', 800, 558, 250, 64, function () {
          actions.start();
        }, true, !state.busy);
        text(p, state.notice ? '本局未能儲存，請保留此頁面' : '本局結果已加入對局紀錄', 640, 620, 15, C.muted, 700, 30);
        var tiles = new TileCollection(p, pool, 'ResultTiles');
        tiles.sync(specs);
        return tiles;
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/ResumeTicketStore.ts", ['cc', './validation.ts'], function (exports) {
  var cclegacy, parseTicket;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      parseTicket = module.parseTicket;
    }],
    execute: function () {
      cclegacy._RF.push({}, "6f50dx3cU1DppOMGopztUP6", "ResumeTicketStore", undefined);

      /** Demo resume credentials only, isolated from offline game saves and scoped by endpoint. */
      var ResumeTicketStore = exports('ResumeTicketStore', /*#__PURE__*/function () {
        function ResumeTicketStore(storage, endpoint) {
          this.key = void 0;
          this.memory = null;
          this.storage = storage;
          this.endpoint = endpoint;
          this.key = 'qingzhu.ws-demo.ticket.v1:' + endpoint;
        }
        var _proto = ResumeTicketStore.prototype;
        _proto.read = function read() {
          if (this.memory) return this.memory;
          try {
            var raw = this.storage.getItem(this.key);
            return raw ? parseTicket(JSON.parse(raw), this.endpoint) : null;
          } catch (_unused) {
            this.clear();
            return null;
          }
        };
        _proto.save = function save(ticket) {
          this.memory = ticket;
          try {
            this.storage.setItem(this.key, JSON.stringify(ticket));
          } catch (_unused2) {
            /* memory-only resume */
          }
        };
        _proto.clear = function clear() {
          this.memory = null;
          try {
            this.storage.removeItem(this.key);
          } catch (_unused3) {
            /* storage unavailable */
          }
        };
        return ResumeTicketStore;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/RetainedButton.ts", ['cc', './Drawing.ts', './Typography.ts', './theme.ts', './Viewport.ts'], function (exports) {
  var cclegacy, UITransform, Graphics, Label, Node, rect, text, col, C, uiScale;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      UITransform = module.UITransform;
      Graphics = module.Graphics;
      Label = module.Label;
      Node = module.Node;
    }, function (module) {
      rect = module.rect;
    }, function (module) {
      text = module.text;
    }, function (module) {
      col = module.col;
      C = module.C;
    }, function (module) {
      uiScale = module.uiScale;
    }],
    execute: function () {
      cclegacy._RF.push({}, "d381fR9GJFKIp8xVUR79t6K", "RetainedButton", undefined);
      /** A button that can update text/enabled state without recreating nodes or listeners. */
      var RetainedButton = exports('RetainedButton', /*#__PURE__*/function () {
        function RetainedButton(parent) {
          var _this = this;
          this.node = void 0;
          this.label = void 0;
          this.graphics = void 0;
          this.enabled = false;
          this.click = void 0;
          this.style = '';
          this.node = rect(parent, 0, 0, 1, 1, C.bg, 0);
          this.graphics = this.node.getComponent(Graphics);
          this.label = text(this.node, '', 0, 0, 22).getComponent(Label);
          this.node.on(Node.EventType.TOUCH_END, function (e) {
            e.propagationStopped = true;
            if (_this.enabled) _this.click == null || _this.click();
          });
        }
        var _proto = RetainedButton.prototype;
        _proto.update = function update(label, x, y, width, height, click, enabled, primary) {
          if (enabled === void 0) {
            enabled = true;
          }
          if (primary === void 0) {
            primary = false;
          }
          this.enabled = enabled;
          this.click = click;
          this.node.active = true;
          this.node.name = "button:" + label;
          this.node.setPosition(x, -y, 0);
          this.node.getComponent(UITransform).setContentSize(Math.max(width, 44 / uiScale()), Math.max(height, 44 / uiScale()));
          this.label.string = label;
          this.label.fontSize = 22 * Math.max(1, 0.72 / uiScale());
          this.label.lineHeight = this.label.fontSize * 1.45;
          this.label.node.getComponent(UITransform).setContentSize(width - 18, Math.max(height, this.label.lineHeight));
          this.label.color = col(enabled ? primary ? C.bg : C.ivory : C.muted);
          var style = width + ":" + height + ":" + enabled + ":" + primary;
          if (style !== this.style) {
            this.graphics.clear();
            this.graphics.fillColor = col(enabled ? primary ? C.gold : '#234b3e' : '#263b32');
            this.graphics.roundRect(-width / 2, -height / 2, width, height, 10);
            this.graphics.fill();
            if (!primary) {
              this.graphics.strokeColor = col(C.line);
              this.graphics.lineWidth = 1;
              this.graphics.stroke();
            }
            this.style = style;
          }
        };
        _proto.hide = function hide() {
          this.node.active = false;
          this.enabled = false;
          this.click = undefined;
        };
        return RetainedButton;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/River.ts", ['cc'], function (exports) {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      exports('riverTiles', riverTiles);
      cclegacy._RF.push({}, "89a4a7M581FbJ3eO3lxk3ku", "River", undefined);
      function riverTiles(game, seat, position) {
        var river = game.players[seat].river,
          horizontal = position === 0 || position === 2;
        var cols = horizontal ? 8 : 6,
          rows = Math.max(1, Math.ceil(river.length / cols));
        var h = Math.min(horizontal ? 32 : 36, ((horizontal ? 77 : 154) - (rows - 1) * 3) / rows);
        var w = Math.min(horizontal ? 25 : 29, h * 0.8);
        var startX = horizontal ? 640 - (cols - 1) * (w + 3) / 2 : position === 3 ? 310 : 792;
        var startY = horizontal ? position === 2 ? 222 : 419 : 267;
        return river.map(function (tile, i) {
          var _game$lastDiscard;
          return {
            key: "river:" + seat + ":" + i,
            tile: tile,
            x: startX + i % cols * (w + 3),
            y: startY + h / 2 + Math.floor(i / cols) * (h + 3),
            width: w,
            height: h,
            selected: ((_game$lastDiscard = game.lastDiscard) == null ? void 0 : _game$lastDiscard.seat) === seat && i === river.length - 1
          };
        });
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/rules.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './model.ts'], function (exports) {
  var _createForOfIteratorHelperLoose, cclegacy, seatNext;
  return {
    setters: [function (module) {
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      seatNext = module.seatNext;
    }],
    execute: function () {
      exports({
        counts: counts,
        isWinning: isWinning,
        legalMoves: legalMoves,
        reactionMoves: reactionMoves
      });
      cclegacy._RF.push({}, "177e6aVX+FQXInRVG2H5uv9", "rules", undefined);
      function counts(hand) {
        var c = Array(34).fill(0);
        for (var _iterator = _createForOfIteratorHelperLoose(hand), _step; !(_step = _iterator()).done;) {
          var t = _step.value;
          if (!Number.isInteger(t) || t < 0 || t > 33) throw new Error('無效牌面');
          c[t]++;
        }
        return c;
      }
      /** Backtracking is required: a triplet may also be part of three sequences. */
      function isWinning(hand, meldCount) {
        if (meldCount === void 0) {
          meldCount = 0;
        }
        if (meldCount < 0 || meldCount > 4 || hand.length !== (4 - meldCount) * 3 + 2) return false;
        var c = counts(hand);
        if (c.some(function (n) {
          return n > 4;
        })) return false;
        var groups = function groups() {
          var t = c.findIndex(function (n) {
            return n > 0;
          });
          if (t < 0) return true;
          if (c[t] >= 3) {
            c[t] -= 3;
            var yes = groups();
            c[t] += 3;
            if (yes) return true;
          }
          if (t < 27 && t % 9 <= 6 && c[t + 1] && c[t + 2]) {
            c[t]--;
            c[t + 1]--;
            c[t + 2]--;
            var _yes = groups();
            c[t]++;
            c[t + 1]++;
            c[t + 2]++;
            if (_yes) return true;
          }
          return false;
        };
        for (var t = 0; t < 34; t++) if (c[t] >= 2) {
          c[t] -= 2;
          var yes = groups();
          c[t] += 2;
          if (yes) return true;
        }
        return false;
      }
      function reactionMoves(state, seat) {
        var last = state.lastDiscard;
        if (!last || last.seat === seat) return [];
        var p = state.players[seat],
          tile = last.tile,
          c = counts(p.hand),
          moves = [];
        if (isWinning([].concat(p.hand, [tile]), p.melds.length)) moves.push({
          type: 'win'
        });
        if (c[tile] >= 3 && state.wall.length > 0) moves.push({
          type: 'kong',
          tile: tile
        });
        if (c[tile] >= 2) moves.push({
          type: 'pon'
        });
        if (seat === seatNext(last.seat) && tile < 27) {
          for (var start = tile - 2; start <= tile; start++) {
            if (start < 0 || start % 9 > 6 || Math.floor(start / 9) !== Math.floor(tile / 9)) continue;
            var other = [start, start + 1, start + 2].filter(function (t) {
              return t !== tile;
            });
            if (other.every(function (t) {
              return c[t] > 0;
            })) moves.push({
              type: 'chi',
              tiles: other
            });
          }
        }
        return moves.length ? [].concat(moves, [{
          type: 'pass'
        }]) : [];
      }
      function legalMoves(state, seat) {
        if (state.phase === 'ended') return [];
        if (state.phase === 'claim') {
          var claim = state.claims.find(function (c) {
            return c.seat === seat;
          });
          return claim && !claim.choice ? claim.moves : [];
        }
        if (state.current !== seat) return [];
        var p = state.players[seat],
          moves = Array.from(new Set(p.hand)).map(function (tile) {
            return {
              type: 'discard',
              tile: tile
            };
          });
        if (state.mayKong && isWinning(p.hand, p.melds.length)) moves.unshift({
          type: 'win'
        });
        if (state.mayKong && state.wall.length) counts(p.hand).forEach(function (n, tile) {
          if (n === 4) moves.unshift({
            type: 'kong',
            tile: tile
          });
        });
        return moves;
      }
      var demo13 = exports('demo13', {
        id: 'demo-13-v1',
        isWinning: isWinning,
        legalMoves: legalMoves
      });
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/RulesDialog.ts", ['cc', './Painter.ts', './VariantRegistry.ts', './Typography.ts', './theme.ts', './Drawing.ts'], function (exports) {
  var cclegacy, presentationFor, text, C, line;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, null, function (module) {
      presentationFor = module.presentationFor;
    }, function (module) {
      text = module.text;
    }, function (module) {
      C = module.C;
    }, function (module) {
      line = module.line;
    }],
    execute: function () {
      exports('renderRules', renderRules);
      cclegacy._RF.push({}, "2d6a1vNk9FHDayRi6W07k1Z", "RulesDialog", undefined);
      function renderRules(parent, ruleId) {
        var variant = presentationFor(ruleId);
        text(parent, '玩法說明', 640, 122, 34, C.ivory, 650, 58, 'center', true);
        text(parent, variant.config.title, 640, 172, 18, C.gold, 650, 30);
        variant.config.rules.forEach(function (_ref, index) {
          var title = _ref[0],
            description = _ref[1];
          var y = 231 + index * 67;
          text(parent, String(index + 1).padStart(2, '0'), 255, y, 18, C.gold, 55, 35);
          text(parent, title, 379, y, 20, C.ivory, 160, 34, 'left');
          text(parent, description, 762, y, 17, C.muted, 566, 55, 'left');
          if (index < variant.config.rules.length - 1) line(parent, 242, y + 33, 1040, y + 33);
        });
        text(parent, variant.config.rulesNote + "\n\u9375\u76E4\uFF1A\u2190 \u2192 \u9078\u724C\uFF0CEnter \u51FA\u724C\uFF1BH \u80E1\u3001P \u78B0\u3001K \u69D3\u3001C \u5403\u3001\u7A7A\u767D\u9375\u904E\u3002", 640, 596, 16, C.muted, 780, 42);
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/selectors.ts", ['cc', './selectors2.ts'], function (exports) {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      var _setter = {};
      _setter.canDiscard = module.canDiscard;
      _setter.canInteract = module.canInteract;
      _setter.displayHand = module.displayHand;
      _setter.relativeSeat = module.relativeSeat;
      exports(_setter);
    }],
    execute: function () {
      cclegacy._RF.push({}, "06edfz9N/dBgaG9n16PnGNk", "selectors", undefined);
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/selectors2.ts", ['cc'], function (exports) {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      exports({
        canDiscard: canDiscard,
        canInteract: canInteract,
        displayHand: displayHand,
        relativeSeat: relativeSeat
      });
      cclegacy._RF.push({}, "94cac3xa85E845SbftNZGZl", "selectors", undefined);
      function displayHand(game) {
        var hand = [].concat(game.players[game.viewerSeat].hand || []);
        if (game.lastDraw !== undefined && game.current === game.viewerSeat && game.phase === 'discard') {
          var index = hand.indexOf(game.lastDraw);
          if (index >= 0) {
            hand.splice(index, 1);
            hand.push(game.lastDraw);
          }
        }
        return hand;
      }
      function canInteract(state) {
        return !state.busy && state.connection === 'connected';
      }
      function canDiscard(state) {
        var _state$game;
        return canInteract(state) && !!((_state$game = state.game) != null && _state$game.legalMoves.some(function (m) {
          return m.type === 'discard';
        }));
      }
      function relativeSeat(game, offset) {
        return (game.viewerSeat + offset) % 4;
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/services.ts", ['cc'], function () {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      cclegacy._RF.push({}, "12d4bUEKo1atLv2xhRMlhDT", "services", undefined);
      /** Both new matches and resume discovery are asynchronous, ready for a backend. */
      /** The frontend only reads records. Authoritative writes belong to the backend/mock adapter. */
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/Simplified13Presentation.ts", ['cc', './tiles.ts'], function (exports) {
  var cclegacy, tileName;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      tileName = module.tileName;
    }],
    execute: function () {
      cclegacy._RF.push({}, "dd787zc/M1MBpu20QRFMDrN", "Simplified13Presentation", undefined);
      var simplified13 = exports('simplified13', {
        config: {
          id: 'demo-13-v1',
          title: '簡化 13 張',
          subtitle: '簡化 13 張・無花牌',
          tableLabel: '練習場',
          iconTile: 31,
          scoreSummary: '單局示範分數 · 自摸 +3，其他各 −1；放銃者 −3',
          rules: [['牌組與胡牌', '136 張、無花牌。四組順子／刻子，加一對將即可胡牌。'], ['吃、碰、槓', '只吃上家的牌；可碰、明槓與暗槓。槓後從牌山補一張。'], ['回應優先', '胡牌優先於碰／槓，再優先於吃。同時胡牌取順序最近的一家。'], ['示範計分', '自摸：贏家 +3，其餘各 −1。放銃：贏家 +3，放銃者 −3。'], ['流局與操作', '牌山耗盡且無人胡牌即流局。選牌後按「打出選牌」，或再點一次。']],
          rulesNote: '每局獨立，東家固定為你。暫不計番型、七對子、補槓、搶槓胡與連莊。'
        },
        turnMessage: function turnMessage(game, selectedTile) {
          var _game$outcome$reason, _game$outcome;
          if (game.phase === 'ended') return (_game$outcome$reason = (_game$outcome = game.outcome) == null ? void 0 : _game$outcome.reason) != null ? _game$outcome$reason : '本局結束';
          if (selectedTile !== undefined) return "\u5DF2\u9078 " + tileName(selectedTile);
          if (game.phase === 'claim') return game.legalMoves.length ? '可以回應這張牌' : '等待牌友回應…';
          return game.current === game.viewerSeat ? '輪到你出牌' : game.players[game.current].name + "\u601D\u8003\u4E2D\u2026";
        },
        actionLabel: function actionLabel(move, game) {
          switch (move.type) {
            case 'win':
              return game.phase === 'claim' ? '胡牌' : '自摸';
            case 'pass':
              return '過';
            case 'pon':
              return '碰';
            case 'kong':
              return "\u69D3 " + tileName(move.tile);
            case 'chi':
              return "\u5403 " + move.tiles.map(tileName).join('・');
            case 'discard':
              return '打出選牌';
          }
        },
        resultTitle: function resultTitle(game) {
          var outcome = game.outcome;
          if (!outcome || outcome.kind === 'draw') return '本局流局';
          var kind = outcome.kind === 'selfDraw' ? '自摸' : '胡牌';
          return outcome.winner === game.viewerSeat ? kind + "\uFF0C\u597D\u624B\u6C23\uFF01" : "" + game.players[outcome.winner].name + kind;
        },
        tileBadge: function tileBadge(_ref) {
          var isDrawn = _ref.isDrawn;
          return isDrawn ? '摸' : null;
        }
      });
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/SnapshotProjection.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './clone.ts', './rules.ts'], function (exports) {
  var _extends, cclegacy, clone, legalMoves;
  return {
    setters: [function (module) {
      _extends = module.extends;
    }, function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      clone = module.clone;
    }, function (module) {
      legalMoves = module.legalMoves;
    }],
    execute: function () {
      exports('project', project);
      cclegacy._RF.push({}, "b408bwhcDNN67KjSMntyCiI", "SnapshotProjection", undefined);
      function project(s, viewer) {
        if (viewer === void 0) {
          viewer = 0;
        }
        return clone({
          id: s.id,
          viewerSeat: viewer,
          ruleId: s.ruleId,
          revision: s.revision,
          phase: s.phase,
          current: s.current,
          dealer: s.dealer,
          wallCount: s.wall.length,
          players: s.players.map(function (p) {
            return {
              seat: p.seat,
              isBot: p.seat !== viewer,
              name: p.name,
              handCount: p.hand.length,
              hand: p.seat === viewer || s.phase === 'ended' ? p.hand : undefined,
              melds: p.melds.map(function (m) {
                return m.kind === 'concealedKong' && p.seat !== viewer && s.phase !== 'ended' ? _extends({}, m, {
                  tiles: [-1, -1, -1, -1]
                }) : m;
              }),
              river: p.river
            };
          }),
          legalMoves: legalMoves(s, viewer),
          lastDiscard: s.lastDiscard,
          lastDraw: s.current === viewer ? s.lastDraw : undefined,
          outcome: s.outcome,
          log: s.log.slice(-12)
        });
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/storage.ts", ['cc', './engine.ts'], function (exports) {
  var cclegacy, assertState;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      assertState = module.assertState;
    }],
    execute: function () {
      exports('readSaved', readSaved);
      cclegacy._RF.push({}, "424f0Ql9hlBZJlZLvk1dgvg", "storage", undefined);
      var SAVE = exports('SAVE', 'qingzhu.session.v1'),
        RECORDS = exports('RECORDS', 'qingzhu.records.v1');
      function readSaved(storage) {
        var raw = storage.getItem(SAVE);
        if (!raw) return null;
        try {
          var s = JSON.parse(raw);
          assertState(s);
          if (s.phase === 'ended') {
            storage.removeItem(SAVE);
            return null;
          }
          return s;
        } catch (_unused) {
          storage.removeItem(SAVE);
          throw Error('上次的牌局資料無法讀取，請開始新對局。');
        }
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/storage2.ts", ['cc'], function () {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      cclegacy._RF.push({}, "516722s035JW5GoVQtTZUeq", "storage", undefined);
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/TableController.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './ConnectionMachine.ts', './TableState.ts', './selectors2.ts'], function (exports) {
  var _extends, _createForOfIteratorHelperLoose, _asyncToGenerator, _regeneratorRuntime, cclegacy, ConnectionMachine, initialTableState, displayHand;
  return {
    setters: [function (module) {
      _extends = module.extends;
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
      _asyncToGenerator = module.asyncToGenerator;
      _regeneratorRuntime = module.regeneratorRuntime;
    }, function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      ConnectionMachine = module.ConnectionMachine;
    }, function (module) {
      initialTableState = module.initialTableState;
    }, function (module) {
      displayHand = module.displayHand;
    }],
    execute: function () {
      cclegacy._RF.push({}, "1974bn816NONr3xe7uw+YIS", "TableController", undefined);
      /** Mahjong application logic: commands and snapshots, never rule adjudication. */
      var TableController = exports('TableController', /*#__PURE__*/function () {
        function TableController(session) {
          var _this = this;
          this.state = initialTableState();
          this.connection = new ConnectionMachine();
          this.listeners = new Set();
          this.unsubscribe = void 0;
          this.activeSessionId = null;
          this.requestCounter = 0;
          this.requestPrefix = 'ui-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
          this.disposed = false;
          this.session = session;
          this.unsubscribe = session.subscribe(function (event) {
            return _this.onEvent(event);
          });
        }
        var _proto = TableController.prototype;
        _proto.getState = function getState() {
          return this.state;
        };
        _proto.subscribe = function subscribe(listener) {
          var _this2 = this;
          this.listeners.add(listener);
          return function () {
            return _this2.listeners["delete"](listener);
          };
        };
        _proto.connect = /*#__PURE__*/function () {
          var _connect = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(ticket) {
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  this.activeSessionId = ticket.sessionId;
                  this.connection.transition('CONNECT');
                  this.set({
                    game: null,
                    selected: -1,
                    notice: '',
                    pending: false
                  });
                  _context.prev = 3;
                  _context.next = 6;
                  return this.session.connect(ticket);
                case 6:
                  _context.next = 13;
                  break;
                case 8:
                  _context.prev = 8;
                  _context.t0 = _context["catch"](3);
                  this.connection.transition('CLOSE');
                  this.set({
                    notice: this.error(_context.t0)
                  });
                  throw _context.t0;
                case 13:
                case "end":
                  return _context.stop();
              }
            }, _callee, this, [[3, 8]]);
          }));
          function connect(_x) {
            return _connect.apply(this, arguments);
          }
          return connect;
        }();
        _proto.select = function select(index) {
          var _this$state$game;
          if (!this.canAct() || !((_this$state$game = this.state.game) != null && _this$state$game.legalMoves.some(function (m) {
            return m.type === 'discard';
          }))) return;
          var hand = displayHand(this.state.game);
          if (index < 0 || index >= hand.length) return;
          if (this.state.selected === index) void this.send({
            type: 'discard',
            tile: hand[index]
          });else this.set({
            selected: index
          });
        };
        _proto.confirmDiscard = function confirmDiscard() {
          if (this.state.game && this.state.selected >= 0) void this.send({
            type: 'discard',
            tile: displayHand(this.state.game)[this.state.selected]
          });
        };
        _proto.send = /*#__PURE__*/function () {
          var _send = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(move) {
            var expectedRevision;
            return _regeneratorRuntime().wrap(function _callee2$(_context2) {
              while (1) switch (_context2.prev = _context2.next) {
                case 0:
                  if (!(!this.canAct() || !this.state.game)) {
                    _context2.next = 2;
                    break;
                  }
                  return _context2.abrupt("return");
                case 2:
                  expectedRevision = this.state.game.revision;
                  this.set({
                    pending: true,
                    notice: ''
                  });
                  _context2.prev = 4;
                  _context2.next = 7;
                  return this.session.send({
                    requestId: this.requestPrefix + '-' + ++this.requestCounter,
                    expectedRevision: expectedRevision,
                    move: move
                  });
                case 7:
                  _context2.next = 12;
                  break;
                case 9:
                  _context2.prev = 9;
                  _context2.t0 = _context2["catch"](4);
                  this.set({
                    notice: this.error(_context2.t0)
                  });
                case 12:
                  _context2.prev = 12;
                  this.set({
                    pending: false
                  });
                  return _context2.finish(12);
                case 15:
                case "end":
                  return _context2.stop();
              }
            }, _callee2, this, [[4, 9, 12, 15]]);
          }));
          function send(_x2) {
            return _send.apply(this, arguments);
          }
          return send;
        }();
        _proto.setForeground = function setForeground(active) {
          this.session.setForeground(active);
        };
        _proto.setPresentationActive = function setPresentationActive(active) {
          var _this$session$setPres, _this$session;
          (_this$session$setPres = (_this$session = this.session).setPresentationActive) == null || _this$session$setPres.call(_this$session, active);
        };
        _proto.dispose = function dispose() {
          this.disposed = true;
          this.unsubscribe();
          this.session.dispose();
          this.listeners.clear();
        };
        _proto.canAct = function canAct() {
          return !this.disposed && !this.state.pending && this.state.connection === 'connected';
        };
        _proto.onEvent = function onEvent(event) {
          var _this$state$game2, _this$state$game3, _this$state$game4;
          if (this.disposed) return;
          if (event.type === 'connection') {
            this.connection.transition(event.status === 'connected' ? 'TRANSPORT_READY' : event.status === 'reconnecting' ? 'LOST' : 'CLOSE');
            this.set({});
            return;
          }
          if (event.type === 'notice') {
            this.set({
              notice: event.message
            });
            return;
          }
          var snapshot = event.snapshot;
          if (snapshot.id !== this.activeSessionId) return;
          if (((_this$state$game2 = this.state.game) == null ? void 0 : _this$state$game2.id) === snapshot.id && snapshot.revision < this.state.game.revision) return;
          var changed = ((_this$state$game3 = this.state.game) == null ? void 0 : _this$state$game3.id) !== snapshot.id || ((_this$state$game4 = this.state.game) == null ? void 0 : _this$state$game4.revision) !== snapshot.revision;
          this.connection.transition('SNAPSHOT');
          this.set({
            game: snapshot,
            selected: changed ? -1 : this.state.selected
          });
        };
        _proto.set = function set(patch) {
          if (this.disposed) return;
          this.state = _extends({}, this.state, patch, {
            connection: this.connection.value
          });
          for (var _iterator = _createForOfIteratorHelperLoose(this.listeners), _step; !(_step = _iterator()).done;) {
            var fn = _step.value;
            fn(this.state);
          }
        };
        _proto.error = function error(value) {
          return value instanceof Error ? value.message : '對局操作暫時無法完成，請稍後再試。';
        };
        return TableController;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/TableState.ts", ['cc'], function (exports) {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      cclegacy._RF.push({}, "4fff7lI75xJlKyHxDyHWOiF", "TableState", undefined);
      var initialTableState = exports('initialTableState', function initialTableState() {
        return {
          game: null,
          selected: -1,
          pending: false,
          connection: 'idle',
          notice: ''
        };
      });
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/TableView.ts", ['cc', './Brand.ts', './Painter.ts', './selectors2.ts', './VariantRegistry.ts', './ActionBar.ts', './HandRow.ts', './MeldGroup.ts', './OpponentHands.ts', './PlayerSeat.ts', './River.ts', './TileCollection.ts', './Typography.ts', './theme.ts', './Button.ts', './Drawing.ts'], function (exports) {
  var cclegacy, Label, drawBrand, relativeSeat, presentationFor, ActionBarView, HandRowView, meldTiles, opponentTiles, renderPlayer, riverTiles, TileCollection, text, C, button, rect, line, circle, node;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      Label = module.Label;
    }, function (module) {
      drawBrand = module.drawBrand;
    }, null, function (module) {
      relativeSeat = module.relativeSeat;
    }, function (module) {
      presentationFor = module.presentationFor;
    }, function (module) {
      ActionBarView = module.ActionBarView;
    }, function (module) {
      HandRowView = module.HandRowView;
    }, function (module) {
      meldTiles = module.meldTiles;
    }, function (module) {
      opponentTiles = module.opponentTiles;
    }, function (module) {
      renderPlayer = module.renderPlayer;
    }, function (module) {
      riverTiles = module.riverTiles;
    }, function (module) {
      TileCollection = module.TileCollection;
    }, function (module) {
      text = module.text;
    }, function (module) {
      C = module.C;
    }, function (module) {
      button = module.button;
    }, function (module) {
      rect = module.rect;
      line = module.line;
      circle = module.circle;
      node = module.node;
    }],
    execute: function () {
      cclegacy._RF.push({}, "8f020a3/PNEiaHbdUR9APE3", "TableView", undefined);
      /** Static table, snapshot content and local input visuals have separate update lifetimes. */
      var TableView = exports('TableView', /*#__PURE__*/function () {
        function TableView(parent, pool, actions) {
          this.summary = void 0;
          this.tiles = void 0;
          this.hand = void 0;
          this.actionBar = void 0;
          this.connection = void 0;
          this.connectionText = void 0;
          this.previous = void 0;
          drawBrand(parent);
          button(parent, '玩法', 1010, 42, 90, 42, function () {
            return actions.openModal('rules');
          });
          button(parent, '暫離', 1120, 42, 90, 42, function () {
            return actions.openModal('leave');
          });
          rect(parent, 640, 350, 1186, 528, '#0b2921', 42, '#4b6650');
          rect(parent, 640, 350, 1168, 510, C.felt, 36, '#628064');
          rect(parent, 640, 350, 1132, 474, C.feltDeep, 24, '#264b3c');
          for (var y = 122; y < 570; y += 8) line(parent, 95, y, 1185, y, '#173b32');
          circle(parent, 640, 353, 56, '#153b31', '#476449');
          circle(parent, 640, 353, 50, '#193e32', '#315843');
          this.summary = node(parent, 'TableSummary', 0, 0, 0, 0);
          this.tiles = new TileCollection(parent, pool, 'PublicTiles');
          this.actionBar = new ActionBarView(parent, actions);
          this.hand = new HandRowView(parent, pool, actions);
          this.connection = node(parent, 'ConnectionOverlay', 0, 0, 0, 0);
          rect(this.connection, 640, 353, 520, 110, '#153b31', 14, C.gold);
          this.connectionText = text(this.connection, '', 640, 353, 26, C.gold, 490, 80).getComponent(Label);
        }
        var _proto = TableView.prototype;
        _proto.update = function update(state) {
          var game = state.game;
          if (!this.previous || this.previous.game !== game) {
            this.updateSummary(state);
            var seat = function seat(offset) {
              return relativeSeat(game, offset);
            };
            this.tiles.sync([].concat(opponentTiles(game), [0, 1, 2, 3].flatMap(function (offset) {
              return riverTiles(game, seat(offset), offset);
            }), meldTiles(game, seat(2), 465, 207, 18), meldTiles(game, seat(3), 115, 412, 19, true), meldTiles(game, seat(1), 1080, 412, 19, true), meldTiles(game, seat(0), 90, 503, 24)));
          }
          this.hand.update(state);
          this.actionBar.update(state);
          this.connection.active = state.connection !== 'connected';
          this.connectionText.string = state.connection === 'closed' ? '目前已離線' : state.connection === 'synchronizing' ? '同步牌桌中…' : '連線中，請稍候…';
          this.previous = state;
        };
        _proto.dispose = function dispose() {
          this.tiles.dispose();
          this.hand.dispose();
        };
        _proto.updateSummary = function updateSummary(state) {
          // These small labels/seats update only on service snapshots, never on local tile selection.
          for (var _i = 0, _arr = [].concat(this.summary.children); _i < _arr.length; _i++) {
            var child = _arr[_i];
            child.removeFromParent();
            child.destroy();
          }
          var p = this.summary,
            game = state.game,
            variant = presentationFor(game.ruleId);
          var seat = function seat(offset) {
              return relativeSeat(game, offset);
            },
            winds = ['東', '南', '西', '北'];
          text(p, variant.config.tableLabel, 540, 42, 18, C.gold, 110, 30);
          text(p, variant.config.subtitle, 720, 42, 17, C.muted, 220, 30);
          renderPlayer(p, game, seat(2), 640, 128, true);
          renderPlayer(p, game, seat(1), 1140, 310);
          renderPlayer(p, game, seat(3), 140, 310);
          text(p, winds[game.current], 640, 325, 28, C.gold, 80, 42, 'center', true);
          text(p, String(game.wallCount), 640, 363, 30, C.ivory, 100, 42);
          text(p, '剩餘牌張', 640, 393, 12, C.muted, 100, 22);
          text(p, "\u4F60 / " + winds[game.viewerSeat] + "\u5BB6" + (game.dealer === game.viewerSeat ? ' · 莊' : ''), 129, 701, 15, C.ivory, 190, 25, 'left');
          text(p, variant.config.scoreSummary, 665, 701, 14, C.muted, 780, 24);
          text(p, "\u7B2C " + (game.revision + 1) + " \u6B65", 1188, 701, 13, C.muted, 130, 24, 'right');
        };
        return TableView;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/theme.ts", ['cc'], function (exports) {
  var cclegacy, Color;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      Color = module.Color;
    }],
    execute: function () {
      cclegacy._RF.push({}, "03801MOOtRO74zqQzRh9yeF", "theme", undefined);
      var C = exports('C', {
        bg: '#101f1d',
        felt: '#183f36',
        feltDeep: '#14372f',
        line: '#315447',
        gold: '#dbc28b',
        ivory: '#f7f1df',
        muted: '#a0b7a8',
        ink: '#213e35',
        red: '#a8453d',
        blue: '#345f87',
        green: '#2b7050',
        disabled: '#5a6c61'
      });
      var col = exports('col', function col(hex) {
        return new Color().fromHEX(hex);
      });
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/TileCollection.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './Drawing.ts'], function (exports) {
  var _createForOfIteratorHelperLoose, cclegacy, node;
  return {
    setters: [function (module) {
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      node = module.node;
    }],
    execute: function () {
      cclegacy._RF.push({}, "a4811ZAeeVEfpj8vPHKYn1K", "TileCollection", undefined);
      /** Retains slots between snapshots and returns only removed slots to the shared pool. */
      var TileCollection = exports('TileCollection', /*#__PURE__*/function () {
        function TileCollection(parent, pool, name) {
          this.root = void 0;
          this.views = new Map();
          this.pool = pool;
          this.root = node(parent, name, 0, 0, 0, 0);
        }
        var _proto = TileCollection.prototype;
        _proto.sync = function sync(specs) {
          var _this = this;
          var keys = new Set(specs.map(function (s) {
            return s.key;
          }));
          if (keys.size !== specs.length) throw Error('TileCollection keys must be unique');
          for (var _iterator = _createForOfIteratorHelperLoose(this.views), _step; !(_step = _iterator()).done;) {
            var _step$value = _step.value,
              key = _step$value[0],
              view = _step$value[1];
            if (!keys.has(key)) {
              this.pool.release(view);
              this.views["delete"](key);
            }
          }
          specs.forEach(function (spec, index) {
            var view = _this.views.get(spec.key);
            if (!view) {
              view = _this.pool.acquire(_this.root, spec);
              _this.views.set(spec.key, view);
            } else view.bind(spec);
            if (view.node.getSiblingIndex() !== index) view.node.setSiblingIndex(index);
          });
        };
        _proto.dispose = function dispose() {
          for (var _iterator2 = _createForOfIteratorHelperLoose(this.views.values()), _step2; !(_step2 = _iterator2()).done;) {
            var view = _step2.value;
            this.pool.release(view);
          }
          this.views.clear();
          this.root.removeFromParent();
          this.root.destroy();
        };
        return TileCollection;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/TilePool.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './TileView.ts'], function (exports) {
  var _createForOfIteratorHelperLoose, cclegacy, instantiate, TileView;
  return {
    setters: [function (module) {
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      instantiate = module.instantiate;
    }, function (module) {
      TileView = module.TileView;
    }],
    execute: function () {
      cclegacy._RF.push({}, "1bd0frcNB1Ktp4TxlBfyODg", "TilePool", undefined);
      /** One pool per app, injected into views. Cached nodes stay detached and inactive. */
      var TilePool = exports('TilePool', /*#__PURE__*/function () {
        function TilePool(prefab, maxIdle) {
          if (maxIdle === void 0) {
            maxIdle = 160;
          }
          this.idle = [];
          this.active = new Set();
          this.created = 0;
          this.reused = 0;
          this.released = 0;
          this.destroyed = 0;
          this.disposed = false;
          this.prefab = prefab;
          this.maxIdle = maxIdle;
        }
        var _proto = TilePool.prototype;
        _proto.acquire = function acquire(parent, spec) {
          if (this.disposed) throw Error('TilePool is disposed');
          var view = this.idle.pop();
          if (view) this.reused++;else {
            var _node$getComponent;
            var node = instantiate(this.prefab);
            view = (_node$getComponent = node.getComponent(TileView)) != null ? _node$getComponent : undefined;
            if (!view) {
              node.destroy();
              throw Error('Tile.prefab 缺少 MahjongTileView');
            }
            this.created++;
          }
          view.node.active = false;
          view.bind(spec);
          view.node.parent = parent;
          view.node.active = true;
          this.active.add(view);
          return view;
        };
        _proto.release = function release(view) {
          if (!this.active["delete"](view)) return;
          view.node.active = false;
          view.resetForPool();
          view.node.removeFromParent();
          this.released++;
          if (!this.disposed && this.idle.length < this.maxIdle) this.idle.push(view);else {
            view.node.destroy();
            this.destroyed++;
          }
        };
        _proto.stats = function stats() {
          return {
            created: this.created,
            reused: this.reused,
            released: this.released,
            destroyed: this.destroyed,
            active: this.active.size,
            idle: this.idle.length
          };
        };
        _proto.dispose = function dispose() {
          this.disposed = true;
          for (var _i = 0, _Array$from = Array.from(this.active); _i < _Array$from.length; _i++) {
            var view = _Array$from[_i];
            this.release(view);
          }
          for (var _iterator = _createForOfIteratorHelperLoose(this.idle), _step; !(_step = _iterator()).done;) {
            var _view = _step.value;
            _view.node.destroy();
            this.destroyed++;
          }
          this.idle.length = 0;
        };
        return TilePool;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/tiles.ts", ['cc'], function (exports) {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      cclegacy._RF.push({}, "cd0edqZIxJBC4DV8Fw7IfzD", "tiles", undefined);
      var tileName = exports('tileName', function tileName(t) {
        return t < 27 ? "" + ['一', '二', '三', '四', '五', '六', '七', '八', '九'][t % 9] + ['萬', '筒', '索'][Math.floor(t / 9)] : ['東', '南', '西', '北', '中', '發', '白'][t - 27];
      });
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/TileSpec.ts", ['cc'], function (exports) {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      exports('tileFrameName', tileFrameName);
      cclegacy._RF.push({}, "a0f66nAprpLSK5jc2KlIzhP", "TileSpec", undefined);
      /** Presentation only. A key identifies a visual slot, never a server-side tile identity. */
      function tileFrameName(tile, back) {
        if (back === void 0) {
          back = false;
        }
        return back ? 'back' : tile < 0 ? 'unknown' : "tile-" + String(tile).padStart(2, '0');
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/TileView.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './TileSpec.ts'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, _createClass, cclegacy, _decorator, SpriteAtlas, Sprite, Node, Component, tileFrameName;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
      _createClass = module.createClass;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      SpriteAtlas = module.SpriteAtlas;
      Sprite = module.Sprite;
      Node = module.Node;
      Component = module.Component;
    }, function (module) {
      tileFrameName = module.tileFrameName;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6;
      cclegacy._RF.push({}, "93f26uLpDBKkYiXlylTFMkF", "TileView", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property,
        executeInEditMode = _decorator.executeInEditMode;
      /** Tile.prefab owns the editable visual hierarchy; this component only binds presentation data. */
      var TileView = exports('TileView', (_dec = ccclass('MahjongTileView'), _dec2 = executeInEditMode(true), _dec3 = property(SpriteAtlas), _dec4 = property(Sprite), _dec5 = property(Node), _dec6 = property({
        range: [0, 33, 1],
        tooltip: '0–8 萬、9–17 筒、18–26 索、27–33 字牌'
      }), _dec7 = property({
        tooltip: '顯示牌背'
      }), _dec8 = property({
        tooltip: '顯示選取外框'
      }), _dec(_class = _dec2(_class = (_class2 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(TileView, _Component);
        function TileView() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "atlas", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "face", _descriptor2, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "selection", _descriptor3, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "_tileId", _descriptor4, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "_faceDown", _descriptor5, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "_selected", _descriptor6, _assertThisInitialized(_this));
          _this.press = void 0;
          _this.frameName = '';
          return _this;
        }
        var _proto = TileView.prototype;
        _proto.onLoad = function onLoad() {
          this.node.on(Node.EventType.TOUCH_END, this.onPress, this);
          this.refresh();
        };
        _proto.onDestroy = function onDestroy() {
          this.node.off(Node.EventType.TOUCH_END, this.onPress, this);
        };
        _proto.bind = function bind(spec) {
          var _spec$name, _spec$angle;
          this._tileId = spec.tile;
          this._faceDown = !!spec.back;
          this._selected = !!spec.selected;
          this.press = spec.onPress;
          this.node.name = (_spec$name = spec.name) != null ? _spec$name : "tile:" + spec.key;
          this.node.setPosition(spec.x, -spec.y, 0);
          this.node.setScale(spec.width / 70, spec.height / 92, 1);
          this.node.angle = (_spec$angle = spec.angle) != null ? _spec$angle : 0;
          this.refresh();
        };
        _proto.resetForPool = function resetForPool() {
          this.press = undefined;
          this._selected = false;
          this._faceDown = true;
          this._tileId = -1;
          this.node.angle = 0;
          this.node.setScale(1, 1, 1);
          this.node.setPosition(0, 0, 0);
          this.refresh();
        };
        _proto.onPress = function onPress(event) {
          if (!this.press) return;
          event.propagationStopped = true;
          this.press();
        };
        _proto.refresh = function refresh() {
          if (this.selection) this.selection.active = this._selected;
          var name = tileFrameName(this._tileId, this._faceDown);
          if (this.face && this.atlas && (this.frameName !== name || !this.face.spriteFrame)) {
            var frame = this.atlas.getSpriteFrame(name);
            if (!frame) throw Error("\u724C\u9762\u5716\u96C6\u7F3A\u5C11 " + name);
            this.face.spriteFrame = frame;
            this.frameName = name;
          }
        };
        _createClass(TileView, [{
          key: "tileId",
          get: function get() {
            return this._tileId;
          },
          set: function set(value) {
            this._tileId = value;
            this.refresh();
          }
        }, {
          key: "faceDown",
          get: function get() {
            return this._faceDown;
          },
          set: function set(value) {
            this._faceDown = value;
            this.refresh();
          }
        }, {
          key: "selected",
          get: function get() {
            return this._selected;
          },
          set: function set(value) {
            this._selected = value;
            this.refresh();
          }
        }]);
        return TileView;
      }(Component), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "atlas", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "face", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "selection", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "_tileId", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "_faceDown", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return false;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "_selected", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return false;
        }
      }), _applyDecoratedDescriptor(_class2.prototype, "tileId", [_dec6], Object.getOwnPropertyDescriptor(_class2.prototype, "tileId"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "faceDown", [_dec7], Object.getOwnPropertyDescriptor(_class2.prototype, "faceDown"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "selected", [_dec8], Object.getOwnPropertyDescriptor(_class2.prototype, "selected"), _class2.prototype)), _class2)) || _class) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/Typography.ts", ['cc', './Drawing.ts', './theme.ts', './Viewport.ts'], function (exports) {
  var cclegacy, Label, node, col, C, uiScale;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      Label = module.Label;
    }, function (module) {
      node = module.node;
    }, function (module) {
      col = module.col;
      C = module.C;
    }, function (module) {
      uiScale = module.uiScale;
    }],
    execute: function () {
      exports('text', text);
      cclegacy._RF.push({}, "524148ranRIbp0RVnDNgEFT", "Typography", undefined);
      function text(parent, value, x, y, size, color, w, h, align, serif) {
        if (size === void 0) {
          size = 20;
        }
        if (color === void 0) {
          color = C.ivory;
        }
        if (w === void 0) {
          w = 300;
        }
        if (h === void 0) {
          h = size * 1.6;
        }
        if (align === void 0) {
          align = 'center';
        }
        if (serif === void 0) {
          serif = false;
        }
        var fontSize = size >= 17 && size <= 28 ? size * Math.max(1, 0.72 / uiScale()) : size;
        var n = node(parent, value.slice(0, 30), x, y, w, Math.max(h, fontSize * 1.45));
        var l = n.addComponent(Label);
        l.string = value;
        l.fontSize = fontSize;
        l.lineHeight = fontSize * 1.45;
        l.fontFamily = serif ? 'Songti TC, Noto Serif TC, serif' : 'Arial, PingFang TC, sans-serif';
        l.color = col(color);
        l.horizontalAlign = align === 'left' ? Label.HorizontalAlign.LEFT : align === 'right' ? Label.HorizontalAlign.RIGHT : Label.HorizontalAlign.CENTER;
        l.verticalAlign = Label.VerticalAlign.CENTER;
        l.overflow = Label.Overflow.SHRINK;
        l.enableWrapText = true;
        return n;
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/validation.ts", ['cc', './JsonCodec.ts', './NetworkError.ts'], function (exports) {
  var cclegacy, isObject, NetworkError;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      isObject = module.isObject;
    }, function (module) {
      NetworkError = module.NetworkError;
    }],
    execute: function () {
      exports({
        isCommand: isCommand,
        isMove: isMove,
        parseRecords: parseRecords,
        parseSnapshot: parseSnapshot,
        parseTicket: parseTicket
      });
      cclegacy._RF.push({}, "bb7e6bWfrdOPbHhMLdG4ZiG", "validation", undefined);
      var integer = function integer(v, min, max) {
        return typeof v === 'number' && Number.isSafeInteger(v) && v >= min && v <= max;
      };
      var text = function text(v, max) {
        if (max === void 0) {
          max = 128;
        }
        return typeof v === 'string' && v.length > 0 && v.length <= max;
      };
      var tile = function tile(v) {
        return integer(v, 0, 33);
      };
      var seat = function seat(v) {
        return integer(v, 0, 3);
      };
      var array = function array(v, check, max) {
        if (max === void 0) {
          max = 144;
        }
        return Array.isArray(v) && v.length <= max && v.every(check);
      };
      var optional = function optional(v, check) {
        return v === undefined || check(v);
      };
      var fail = function fail() {
        return new NetworkError('PROTOCOL', '伺服器回覆資料不完整，請重新進入牌桌');
      };
      function isMove(v) {
        if (!isObject(v)) return false;
        switch (v.type) {
          case 'discard':
          case 'kong':
            return tile(v.tile);
          case 'win':
          case 'pass':
          case 'pon':
            return true;
          case 'chi':
            return Array.isArray(v.tiles) && v.tiles.length === 2 && v.tiles.every(tile);
          default:
            return false;
        }
      }
      function isCommand(v) {
        return isObject(v) && text(v.requestId) && integer(v.expectedRevision, 0, Number.MAX_SAFE_INTEGER) && isMove(v.move);
      }
      function isMeld(v) {
        if (!isObject(v) || !seat(v.from)) return false;
        if (!['chi', 'pon', 'kong', 'concealedKong'].includes(v.kind)) return false;
        var size = v.kind === 'chi' || v.kind === 'pon' ? 3 : 4;
        return Array.isArray(v.tiles) && v.tiles.length === size && v.tiles.every(function (t) {
          return tile(t) || v.kind === 'concealedKong' && t === -1;
        });
      }
      function isOutcome(v) {
        return isObject(v) && ['selfDraw', 'discardWin', 'draw'].includes(v.kind) && optional(v.winner, seat) && optional(v.loser, seat) && optional(v.tile, tile) && (v.kind === 'draw' || seat(v.winner)) && (v.kind !== 'discardWin' || seat(v.loser) && tile(v.tile)) && Array.isArray(v.delta) && v.delta.length === 4 && v.delta.every(function (n) {
          return typeof n === 'number' && Number.isFinite(n);
        }) && text(v.reason, 1000);
      }
      function parseSnapshot(value) {
        if (!isObject(value)) throw fail();
        var s = value;
        if (!text(s.id) || !text(s.ruleId) || !integer(s.revision, 0, Number.MAX_SAFE_INTEGER) || !['discard', 'claim', 'ended'].includes(s.phase) || !seat(s.viewerSeat) || !seat(s.current) || !seat(s.dealer) || !integer(s.wallCount, 0, 256) || !Array.isArray(s.players) || s.players.length !== 4 || !array(s.legalMoves, isMove, 64) || !array(s.log, function (v) {
          return text(v, 1000);
        }, 100) || !optional(s.lastDraw, tile) || !optional(s.outcome, isOutcome) || s.phase === 'ended' && !isOutcome(s.outcome) || !optional(s.lastDiscard, function (v) {
          return isObject(v) && seat(v.seat) && tile(v.tile);
        })) throw fail();
        s.players.forEach(function (p, index) {
          if (!isObject(p) || p.seat !== index || !text(p.name, 100) || !integer(p.handCount, 0, 32) || !optional(p.isBot, function (v) {
            return typeof v === 'boolean';
          }) || !array(p.melds, isMeld, 8) || !array(p.river, tile) || !optional(p.hand, function (v) {
            return array(v, tile, 32);
          }) || index === s.viewerSeat && (!Array.isArray(p.hand) || p.hand.length !== p.handCount) || s.phase !== 'ended' && index !== s.viewerSeat && p.hand !== undefined) throw fail();
        });
        return s;
      }
      function parseTicket(value, endpoint) {
        if (!isObject(value) || !text(value.id) || !text(value.sessionId) || !seat(value.seat) || value.transport !== 'websocket' || value.endpoint !== endpoint || !text(value.resumeToken, 512)) throw fail();
        return value;
      }
      function parseRecords(value) {
        if (!array(value, function (v) {
          return isObject(v) && text(v.id) && text(v.ruleId) && seat(v.viewerSeat) && text(v.startedAt) && Number.isFinite(Date.parse(v.startedAt)) && text(v.endedAt) && Number.isFinite(Date.parse(v.endedAt)) && Array.isArray(v.names) && v.names.length === 4 && v.names.every(function (n) {
            return text(n, 100);
          }) && isOutcome(v.outcome) && array(v.winnerHand, tile, 32) && array(v.winnerMelds, isMeld, 8);
        }, 100)) throw fail();
        return value;
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/VariantPresentation.ts", ['cc'], function () {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      cclegacy._RF.push({}, "83ac8bo3CVLzr++w93+Vi/g", "VariantPresentation", undefined);
      /** Presentation only. No win, score or legal-move calculation is allowed here. */
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/VariantRegistry.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './Simplified13Presentation.ts'], function (exports) {
  var _createForOfIteratorHelperLoose, cclegacy, simplified13;
  return {
    setters: [function (module) {
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      simplified13 = module.simplified13;
    }],
    execute: function () {
      exports('presentationFor', presentationFor);
      cclegacy._RF.push({}, "e1074g36gJGhb7yJGe6NStu", "VariantRegistry", undefined);
      var VariantRegistry = exports('VariantRegistry', /*#__PURE__*/function () {
        function VariantRegistry(variants) {
          this.entries = new Map();
          for (var _iterator = _createForOfIteratorHelperLoose(variants), _step; !(_step = _iterator()).done;) {
            var variant = _step.value;
            this.register(variant);
          }
        }
        var _proto = VariantRegistry.prototype;
        _proto.register = function register(variant) {
          if (this.entries.has(variant.config.id)) throw Error("\u91CD\u8907\u7684\u73A9\u6CD5\u8B58\u5225\u78BC\uFF1A" + variant.config.id);
          this.entries.set(variant.config.id, variant);
        };
        _proto.get = function get(id) {
          return this.entries.get(id);
        };
        _proto.list = function list() {
          return Array.from(this.entries.values());
        };
        return VariantRegistry;
      }());
      var variantRegistry = exports('variantRegistry', new VariantRegistry([simplified13]));
      var DEMO_RULE_ID = exports('DEMO_RULE_ID', simplified13.config.id);
      /** Unknown rules show a neutral label; they never inherit demo scoring rules. */
      var unknown = {
        config: {
          id: 'unknown',
          title: '未支援玩法',
          subtitle: '玩法資料尚未提供',
          tableLabel: '麻將對局',
          iconTile: 33,
          scoreSummary: '分數依對局結果顯示',
          rules: [],
          rulesNote: '尚未提供此玩法的說明。'
        },
        turnMessage: function turnMessage(game) {
          var _game$outcome$reason, _game$outcome;
          return (_game$outcome$reason = (_game$outcome = game.outcome) == null ? void 0 : _game$outcome.reason) != null ? _game$outcome$reason : '等待對局更新…';
        },
        actionLabel: function actionLabel(move) {
          return {
            win: '胡牌',
            pass: '過',
            pon: '碰',
            kong: '槓',
            chi: '吃',
            discard: '出牌'
          }[move.type];
        },
        resultTitle: function resultTitle(game) {
          var _game$outcome$reason2, _game$outcome2;
          return (_game$outcome$reason2 = (_game$outcome2 = game.outcome) == null ? void 0 : _game$outcome2.reason) != null ? _game$outcome$reason2 : '本局結束';
        },
        tileBadge: function tileBadge() {
          return null;
        }
      };
      function presentationFor(ruleId) {
        var _variantRegistry$get;
        return (_variantRegistry$get = variantRegistry.get(ruleId)) != null ? _variantRegistry$get : unknown;
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/ViewActions.ts", ['cc'], function () {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      cclegacy._RF.push({}, "8267cDb5kBMr73X3gHGZyXm", "ViewActions", undefined);
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/ViewActions2.ts", ['cc'], function (exports) {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      exports('createViewActions', createViewActions);
      cclegacy._RF.push({}, "d22f8TXvVxMPpkWhO0XRtrX", "ViewActions", undefined);
      function createViewActions(dispatch) {
        return {
          start: function start() {
            return dispatch({
              type: 'start'
            });
          },
          resume: function resume() {
            return dispatch({
              type: 'resume'
            });
          },
          requestNew: function requestNew() {
            return dispatch({
              type: 'request-new'
            });
          },
          confirmLeave: function confirmLeave() {
            return dispatch({
              type: 'confirm-leave'
            });
          },
          openModal: function openModal(modal) {
            return dispatch({
              type: 'modal',
              modal: modal
            });
          },
          selectTile: function selectTile(index) {
            return dispatch({
              type: 'select-tile',
              index: index
            });
          },
          confirmDiscard: function confirmDiscard() {
            return dispatch({
              type: 'confirm-discard'
            });
          },
          move: function (_move) {
            function move(_x) {
              return _move.apply(this, arguments);
            }
            move.toString = function () {
              return _move.toString();
            };
            return move;
          }(function (move) {
            return dispatch({
              type: 'move',
              move: move
            });
          }),
          recordsPage: function recordsPage(page) {
            return dispatch({
              type: 'records-page',
              page: page
            });
          }
        };
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/Viewport.ts", ['cc'], function (exports) {
  var cclegacy, game;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      game = module.game;
    }],
    execute: function () {
      exports('uiScale', uiScale);
      cclegacy._RF.push({}, "15b95wlpxtFuJ97ics7xpU1", "Viewport", undefined);
      function uiScale() {
        var canvas = game.canvas;
        if (!canvas || typeof canvas.getBoundingClientRect !== 'function') return 1;
        var r = canvas.getBoundingClientRect();
        return Math.min(r.width / 1280, r.height / 720) || 1;
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/WebSocketTransport.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './NetworkError.ts'], function (exports) {
  var _createForOfIteratorHelperLoose, _createClass, cclegacy, NetworkError;
  return {
    setters: [function (module) {
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
      _createClass = module.createClass;
    }, function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      NetworkError = module.NetworkError;
    }],
    execute: function () {
      exports('validateEndpoint', validateEndpoint);
      cclegacy._RF.push({}, "46b1fUICHhLcZ8jnUICtlIO", "WebSocketTransport", undefined);

      /** Structural browser socket port; tests and other platforms can inject an implementation. */

      function validateEndpoint(endpoint) {
        var url = new URL(endpoint);
        if (!['ws:', 'wss:'].includes(url.protocol) || url.username || url.password || url.hash) throw new NetworkError('ENDPOINT', '請使用有效的 WS 或 WSS 連線網址');
        if (typeof location !== 'undefined' && location.protocol === 'https:' && url.protocol !== 'wss:') throw new NetworkError('ENDPOINT', 'HTTPS 網頁需要使用 WSS 連線');
        return url.href;
      }

      /** Socket lifecycle only: no JSON, Mahjong, storage, Cocos, or credentials. */
      var WebSocketTransport = exports('WebSocketTransport', /*#__PURE__*/function () {
        function WebSocketTransport(options) {
          this.endpoint = void 0;
          this.socket = void 0;
          this.listeners = new Set();
          this.timer = void 0;
          this.generation = 0;
          this.retries = 0;
          this.wanted = false;
          this.disposed = false;
          this.current = 'closed';
          this.opening = void 0;
          this.options = options;
          this.endpoint = validateEndpoint(options.endpoint);
        }
        var _proto = WebSocketTransport.prototype;
        _proto.subscribe = function subscribe(listener) {
          var _this = this;
          this.listeners.add(listener);
          return function () {
            return _this.listeners["delete"](listener);
          };
        };
        _proto.connect = function connect() {
          if (this.disposed) return Promise.reject(new NetworkError('DISPOSED', '連線服務已關閉'));
          if (this.current === 'open') return Promise.resolve();
          if (this.opening) return this.opening.promise;
          var resolve, reject;
          var promise = new Promise(function (ok, fail) {
            resolve = ok;
            reject = fail;
          });
          this.opening = {
            promise: promise,
            resolve: resolve,
            reject: reject
          };
          if (!this.wanted) {
            this.wanted = true;
            this.retries = 0;
            this.openSocket();
          }
          return promise;
        };
        _proto.send = function send(data) {
          var _this$socket;
          if (this.current !== 'open' || ((_this$socket = this.socket) == null ? void 0 : _this$socket.readyState) !== 1) throw new NetworkError('DISCONNECTED', '連線中斷，請等待牌桌重新同步');
          if (this.socket.bufferedAmount > 256 * 1024) throw new NetworkError('BACKPRESSURE', '網路忙碌中，請稍後再試');
          try {
            this.socket.send(data);
          } catch (_unused) {
            this.restart();
            throw new NetworkError('DISCONNECTED', '訊息傳送失敗，正在重新連線');
          }
        }
        /** Only valid server traffic proves a usable connection; open-close loops stay bounded. */;
        _proto.markHealthy = function markHealthy() {
          this.retries = 0;
        };
        _proto.restart = function restart() {
          if (!this.wanted || this.disposed) return;
          this.retry(new NetworkError('DISCONNECTED', '連線中斷，正在重新連線'));
        };
        _proto.close = function close(error) {
          var _this$opening;
          if (error === void 0) {
            error = new NetworkError('CLOSED', '連線已關閉');
          }
          this.wanted = false;
          this.releaseSocket();
          (_this$opening = this.opening) == null || _this$opening.reject(error);
          this.opening = undefined;
          this.setStatus('closed', error);
        };
        _proto.dispose = function dispose() {
          if (this.disposed) return;
          this.disposed = true;
          this.close(new NetworkError('DISPOSED', '連線服務已關閉'));
          this.listeners.clear();
        };
        _proto.openSocket = function openSocket() {
          var _this2 = this,
            _this$options$connect;
          this.releaseSocket();
          if (!this.wanted) return;
          var generation = this.generation;
          this.setStatus(this.retries ? 'reconnecting' : 'connecting');
          var socket;
          try {
            var _this$options$socketF;
            socket = ((_this$options$socketF = this.options.socketFactory) != null ? _this$options$socketF : function (url) {
              return new WebSocket(url);
            })(this.endpoint);
            this.socket = socket;
          } catch (_unused2) {
            this.retry(new NetworkError('CONNECT_FAILED', '無法建立連線'));
            return;
          }
          var current = function current() {
            return _this2.wanted && _this2.generation === generation && _this2.socket === socket;
          };
          socket.onopen = function () {
            var _this2$opening;
            if (!current()) return;
            _this2.clearTimer();
            _this2.setStatus('open');
            (_this2$opening = _this2.opening) == null || _this2$opening.resolve();
            _this2.opening = undefined;
          };
          socket.onmessage = function (event) {
            if (current()) _this2.emit({
              type: 'message',
              data: event.data
            });
          };
          socket.onerror = function () {
            // Browsers follow error with close. A connect deadline also covers a silent handshake.
            // Keeping the close event preserves terminal authentication/policy close codes.
          };
          socket.onclose = function (event) {
            if (!current()) return;
            var error = new NetworkError('DISCONNECTED', '連線中斷，正在重新連線');
            if ([1000, 1008, 4001, 4002, 4003, 4401, 4403].includes(event.code)) _this2.close(new NetworkError('SERVER_CLOSED', '伺服器已結束連線，請重新進入牌桌'));else _this2.retry(error);
          };
          this.timer = setTimeout(function () {
            if (current()) _this2.retry(new NetworkError('CONNECT_TIMEOUT', '建立連線逾時'));
          }, (_this$options$connect = this.options.connectTimeoutMs) != null ? _this$options$connect : 8000);
        };
        _proto.retry = function retry(error) {
          var _this$options$maxRetr,
            _this$options$reconne,
            _this$options$reconne2,
            _this$options$random,
            _this3 = this;
          this.releaseSocket();
          if (!this.wanted) return;
          if (this.retries >= ((_this$options$maxRetr = this.options.maxRetries) != null ? _this$options$maxRetr : 6)) {
            this.close(new NetworkError('RETRY_EXHAUSTED', '暫時無法連線，請回大廳後重試'));
            return;
          }
          var base = (_this$options$reconne = this.options.reconnectBaseMs) != null ? _this$options$reconne : 500;
          var cap = (_this$options$reconne2 = this.options.reconnectMaxMs) != null ? _this$options$reconne2 : 10000;
          var delay = Math.min(cap, base * Math.pow(2, this.retries++) * (0.75 + ((_this$options$random = this.options.random) != null ? _this$options$random : Math.random)() * 0.5));
          this.setStatus('reconnecting', error);
          this.timer = setTimeout(function () {
            return _this3.openSocket();
          }, delay);
        };
        _proto.releaseSocket = function releaseSocket() {
          this.generation++;
          this.clearTimer();
          var socket = this.socket;
          this.socket = undefined;
          if (socket) {
            socket.onopen = socket.onmessage = socket.onclose = socket.onerror = null;
            try {
              socket.close(1000, 'client reset');
            } catch (_unused3) {
              /* already closed */
            }
          }
        };
        _proto.clearTimer = function clearTimer() {
          clearTimeout(this.timer);
          this.timer = undefined;
        };
        _proto.setStatus = function setStatus(status, error) {
          this.current = status;
          this.emit({
            type: 'status',
            status: status,
            error: error
          });
        };
        _proto.emit = function emit(event) {
          for (var _iterator = _createForOfIteratorHelperLoose(this.listeners), _step; !(_step = _iterator()).done;) {
            var listener = _step.value;
            listener(event);
          }
        };
        _createClass(WebSocketTransport, [{
          key: "status",
          get: function get() {
            return this.current;
          }
        }]);
        return WebSocketTransport;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/wire.ts", ['cc'], function () {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      cclegacy._RF.push({}, "ebf52MDDRVNtJi9sBpyIvMq", "wire", undefined);
      /** Provisional v1 protocol. Keep server-specific field mapping behind WireCodec. */
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/WsClient.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './JsonCodec.ts', './NetworkError.ts', './PendingRequests.ts', './WebSocketTransport.ts'], function (exports) {
  var _asyncToGenerator, _createForOfIteratorHelperLoose, _regeneratorRuntime, cclegacy, JsonCodec, NetworkError, PendingRequests, WebSocketTransport;
  return {
    setters: [function (module) {
      _asyncToGenerator = module.asyncToGenerator;
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
      _regeneratorRuntime = module.regeneratorRuntime;
    }, function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      JsonCodec = module.JsonCodec;
    }, function (module) {
      NetworkError = module.NetworkError;
    }, function (module) {
      PendingRequests = module.PendingRequests;
    }, function (module) {
      WebSocketTransport = module.WebSocketTransport;
    }],
    execute: function () {
      cclegacy._RF.push({}, "8dcc9oOHx5PboHQTdMaRwSp", "WsClient", undefined);
      /** Shared RPC, push events and application heartbeat over a native WebSocket. */
      var WsClient = exports('WsClient', /*#__PURE__*/function () {
        function WsClient(options) {
          var _options$codec,
            _this = this;
          this.transport = void 0;
          this.codec = void 0;
          this.pending = new PendingRequests();
          this.listeners = new Set();
          this.sequence = 0;
          this.prefix = 'ws-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
          this.heartbeat = void 0;
          this.foreground = true;
          this.heartbeatGeneration = 0;
          this.unsubscribe = void 0;
          this.options = options;
          this.codec = (_options$codec = options.codec) != null ? _options$codec : new JsonCodec();
          this.transport = new WebSocketTransport(options);
          this.unsubscribe = this.transport.subscribe(function (event) {
            return _this.onTransport(event);
          });
        }
        var _proto = WsClient.prototype;
        _proto.connect = function connect() {
          return this.transport.connect();
        };
        _proto.subscribe = function subscribe(listener) {
          var _this2 = this;
          this.listeners.add(listener);
          return function () {
            return _this2.listeners["delete"](listener);
          };
        };
        _proto.request = function request(method, payload, options) {
          var _options$id;
          if (options === void 0) {
            options = {};
          }
          if (this.transport.status !== 'open') return Promise.reject(new NetworkError('DISCONNECTED', '連線尚未就緒，請稍後再試'));
          var id = (_options$id = options.id) != null ? _options$id : this.prefix + '-' + ++this.sequence;
          var promise;
          var encoded;
          try {
            var _ref, _options$timeoutMs;
            encoded = this.codec.encode({
              v: 1,
              kind: 'request',
              id: id,
              method: method,
              payload: payload
            });
            promise = this.pending.add(id, (_ref = (_options$timeoutMs = options.timeoutMs) != null ? _options$timeoutMs : this.options.requestTimeoutMs) != null ? _ref : 8000, options.signal);
          } catch (error) {
            return Promise.reject(error);
          }
          try {
            this.transport.send(encoded);
          } catch (error) {
            this.pending.reject(id, error);
          }
          return promise;
        };
        _proto.setForeground = function setForeground(active) {
          if (this.foreground === active) return;
          this.foreground = active;
          this.stopHeartbeat();
          // Timers may have been frozen. A fresh connection must synchronize before play resumes.
          if (active) this.transport.restart();
        };
        _proto.protocolFailure = function protocolFailure() {
          this.transport.close(new NetworkError('PROTOCOL', '伺服器訊息格式不相容，請重新進入牌桌'));
        };
        _proto.dispose = function dispose() {
          this.transport.dispose();
          this.unsubscribe();
          this.stopHeartbeat();
          this.pending.rejectAll(new NetworkError('DISPOSED', '連線服務已關閉'));
          this.listeners.clear();
        };
        _proto.onTransport = function onTransport(event) {
          if (event.type === 'status') {
            var _event$error;
            this.stopHeartbeat();
            if (event.status !== 'open') this.pending.rejectAll((_event$error = event.error) != null ? _event$error : new NetworkError('DISCONNECTED', '連線中斷，請等待同步'));
            this.emit(event);
            if (event.status === 'open') this.scheduleHeartbeat();
            return;
          }
          var message;
          try {
            message = this.codec.decode(event.data);
            if (message.kind === 'request') throw Error('unexpected request');
          } catch (_unused) {
            this.protocolFailure();
            return;
          }
          this.transport.markHealthy();
          if (message.kind === 'response') {
            if (message.ok) this.pending.resolve(message.id, message.payload);else this.pending.reject(message.id, new NetworkError(message.error.code, message.error.message));
          } else if (message.kind === 'event') {
            this.emit({
              type: 'event',
              method: message.method,
              payload: message.payload
            });
          }
        };
        _proto.scheduleHeartbeat = function scheduleHeartbeat() {
          var _this3 = this,
            _this$options$heartbe;
          if (!this.foreground || this.transport.status !== 'open') return;
          var generation = this.heartbeatGeneration;
          this.heartbeat = setTimeout( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
            var _this3$options$heartb, result;
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  _context.prev = 0;
                  _context.next = 3;
                  return _this3.request('system.ping', null, {
                    timeoutMs: (_this3$options$heartb = _this3.options.heartbeatTimeoutMs) != null ? _this3$options$heartb : 5000
                  });
                case 3:
                  result = _context.sent;
                  if (!(result !== 'pong')) {
                    _context.next = 6;
                    break;
                  }
                  throw new NetworkError('PROTOCOL', '無效的心跳回覆');
                case 6:
                  _context.next = 12;
                  break;
                case 8:
                  _context.prev = 8;
                  _context.t0 = _context["catch"](0);
                  if (generation === _this3.heartbeatGeneration) {
                    if (_context.t0 instanceof NetworkError && _context.t0.code === 'TIMEOUT') _this3.transport.restart();else _this3.protocolFailure();
                  }
                  return _context.abrupt("return");
                case 12:
                  if (generation === _this3.heartbeatGeneration) _this3.scheduleHeartbeat();
                case 13:
                case "end":
                  return _context.stop();
              }
            }, _callee, null, [[0, 8]]);
          })), (_this$options$heartbe = this.options.heartbeatIntervalMs) != null ? _this$options$heartbe : 15000);
        };
        _proto.stopHeartbeat = function stopHeartbeat() {
          this.heartbeatGeneration++;
          clearTimeout(this.heartbeat);
          this.heartbeat = undefined;
        };
        _proto.emit = function emit(event) {
          for (var _iterator = _createForOfIteratorHelperLoose(this.listeners), _step; !(_step = _iterator()).done;) {
            var listener = _step.value;
            listener(event);
          }
        };
        return WsClient;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/WsGameSession.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './JsonCodec.ts', './NetworkError.ts', './validation.ts'], function (exports) {
  var _createForOfIteratorHelperLoose, _asyncToGenerator, _regeneratorRuntime, _extends, cclegacy, isObject, NetworkError, parseSnapshot, isCommand;
  return {
    setters: [function (module) {
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
      _asyncToGenerator = module.asyncToGenerator;
      _regeneratorRuntime = module.regeneratorRuntime;
      _extends = module.extends;
    }, function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      isObject = module.isObject;
    }, function (module) {
      NetworkError = module.NetworkError;
    }, function (module) {
      parseSnapshot = module.parseSnapshot;
      isCommand = module.isCommand;
    }],
    execute: function () {
      cclegacy._RF.push({}, "72da5Sv3RpKs6ovxSSEJ65Y", "WsGameSession", undefined);

      /** Adapts the provisional network protocol to the existing frontend session port. */
      var WsGameSession = exports('WsGameSession', /*#__PURE__*/function () {
        function WsGameSession(client) {
          var _this = this;
          this.listeners = new Set();
          this.ticket = void 0;
          this.snapshot = void 0;
          this.ready = false;
          this.disposed = false;
          this.generation = 0;
          this.syncAttempt = 0;
          this.syncing = void 0;
          this.unsubscribe = void 0;
          this.client = client;
          this.unsubscribe = client.subscribe(function (event) {
            return _this.onClient(event);
          });
        }
        var _proto = WsGameSession.prototype;
        _proto.connect = /*#__PURE__*/function () {
          var _connect = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(ticket) {
            var generation;
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  if (!this.disposed) {
                    _context.next = 2;
                    break;
                  }
                  throw new NetworkError('DISPOSED', '對局服務已關閉');
                case 2:
                  if (!(ticket.transport !== 'websocket' || ticket.endpoint !== this.client.transport.endpoint)) {
                    _context.next = 4;
                    break;
                  }
                  throw new NetworkError('TICKET', '配桌連線資訊不正確');
                case 4:
                  this.generation++;
                  generation = this.generation;
                  this.ticket = _extends({}, ticket);
                  this.snapshot = undefined;
                  this.ready = false;
                  this.syncing = undefined;
                  _context.prev = 10;
                  _context.next = 13;
                  return this.client.connect();
                case 13:
                  if (!(this.disposed || generation !== this.generation)) {
                    _context.next = 15;
                    break;
                  }
                  throw new NetworkError('CANCELLED', '牌桌已切換');
                case 15:
                  _context.next = 17;
                  return this.synchronize();
                case 17:
                  _context.next = 23;
                  break;
                case 19:
                  _context.prev = 19;
                  _context.t0 = _context["catch"](10);
                  if (generation === this.generation) {
                    this.ticket = undefined;
                    this.ready = false;
                  }
                  throw _context.t0;
                case 23:
                case "end":
                  return _context.stop();
              }
            }, _callee, this, [[10, 19]]);
          }));
          function connect(_x) {
            return _connect.apply(this, arguments);
          }
          return connect;
        }();
        _proto.subscribe = function subscribe(listener) {
          var _this2 = this;
          this.listeners.add(listener);
          return function () {
            return _this2.listeners["delete"](listener);
          };
        };
        _proto.send = /*#__PURE__*/function () {
          var _send = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(command) {
            var generation, result, snapshot;
            return _regeneratorRuntime().wrap(function _callee2$(_context2) {
              while (1) switch (_context2.prev = _context2.next) {
                case 0:
                  if (!(!this.ready || !this.ticket || !this.snapshot)) {
                    _context2.next = 2;
                    break;
                  }
                  throw new NetworkError('SYNCHRONIZING', '牌桌同步中，請稍後再操作');
                case 2:
                  if (!(!isCommand(command) || command.expectedRevision !== this.snapshot.revision)) {
                    _context2.next = 4;
                    break;
                  }
                  throw new NetworkError('STALE_REVISION', '牌桌已更新，請重新操作');
                case 4:
                  generation = this.generation;
                  _context2.prev = 5;
                  _context2.next = 8;
                  return this.client.request('game.command', {
                    sessionId: this.ticket.sessionId,
                    command: command
                  }, {
                    id: command.requestId
                  });
                case 8:
                  result = _context2.sent;
                  if (!(generation !== this.generation || this.disposed)) {
                    _context2.next = 11;
                    break;
                  }
                  throw new NetworkError('CANCELLED', '牌桌已切換，操作結果將以新快照為準');
                case 11:
                  if (!(!isObject(result) || result.requestId !== command.requestId)) {
                    _context2.next = 13;
                    break;
                  }
                  throw new NetworkError('PROTOCOL', '操作回覆編號不一致');
                case 13:
                  snapshot = this.validateSnapshot(result.snapshot);
                  if (!(snapshot.revision <= command.expectedRevision)) {
                    _context2.next = 16;
                    break;
                  }
                  throw new NetworkError('PROTOCOL', '操作回覆缺少新的牌桌狀態');
                case 16:
                  // A newer push can arrive before this acknowledgement. Never rewind it.
                  this.acceptSnapshot(snapshot, command.requestId);
                  _context2.next = 23;
                  break;
                case 19:
                  _context2.prev = 19;
                  _context2.t0 = _context2["catch"](5);
                  if (generation === this.generation && !this.disposed) {
                    if (_context2.t0 instanceof NetworkError && _context2.t0.code === 'PROTOCOL') this.client.protocolFailure();else if (this.client.transport.status === 'open') void this.synchronize()["catch"](function () {});
                  }
                  throw _context2.t0;
                case 23:
                case "end":
                  return _context2.stop();
              }
            }, _callee2, this, [[5, 19]]);
          }));
          function send(_x2) {
            return _send.apply(this, arguments);
          }
          return send;
        }();
        _proto.setForeground = function setForeground(active) {
          this.client.setForeground(active);
        };
        _proto.dispose = function dispose() {
          this.disposed = true;
          this.generation++;
          this.ready = false;
          this.unsubscribe();
          this.listeners.clear();
        };
        _proto.synchronize = function synchronize() {
          var _this$syncing,
            _this$snapshot$revisi,
            _this$snapshot,
            _this3 = this;
          var generation = this.generation;
          if (((_this$syncing = this.syncing) == null ? void 0 : _this$syncing.generation) === generation) return this.syncing.promise;
          if (!this.ticket || this.disposed) return Promise.reject(new NetworkError('CANCELLED', '牌桌已切換'));
          var ticket = this.ticket;
          var attempt = ++this.syncAttempt;
          this.ready = false;
          this.emit({
            type: 'connection',
            status: 'connected'
          });
          var promise = this.client.request('session.join', {
            sessionId: ticket.sessionId,
            resumeToken: ticket.resumeToken,
            lastRevision: (_this$snapshot$revisi = (_this$snapshot = this.snapshot) == null ? void 0 : _this$snapshot.revision) != null ? _this$snapshot$revisi : null
          }).then(function (result) {
            if (generation !== _this3.generation || attempt !== _this3.syncAttempt || _this3.disposed) throw new NetworkError('CANCELLED', '牌桌已切換');
            if (!isObject(result)) throw new NetworkError('PROTOCOL', '缺少牌桌資料');
            var snapshot = _this3.validateSnapshot(result.snapshot);
            if (_this3.snapshot && snapshot.revision < _this3.snapshot.revision) throw new NetworkError('PROTOCOL', '重新同步的牌桌版本已過期');
            _this3.ready = true;
            _this3.acceptSnapshot(snapshot);
          })["catch"](function (error) {
            if (generation === _this3.generation && attempt === _this3.syncAttempt && !_this3.disposed) {
              _this3.ready = false;
              if (error instanceof NetworkError && error.code === 'PROTOCOL') _this3.client.protocolFailure();else if (_this3.client.transport.status === 'open') {
                _this3.emit({
                  type: 'notice',
                  message: error instanceof Error ? error.message : '牌桌同步失敗'
                });
                // A failed join is not playable. Authentication/expired tickets require re-entry.
                _this3.client.transport.close(new NetworkError('JOIN_FAILED', '牌桌同步失敗，請重新進入'));
              }
            }
            throw error;
          })["finally"](function () {
            var _this3$syncing;
            if (((_this3$syncing = _this3.syncing) == null ? void 0 : _this3$syncing.promise) === promise) _this3.syncing = undefined;
          });
          this.syncing = {
            generation: generation,
            promise: promise
          };
          return promise;
        };
        _proto.onClient = function onClient(event) {
          if (!this.ticket || this.disposed) return;
          if (event.type === 'status') {
            if (event.status === 'open') void this.synchronize()["catch"](function () {});else {
              this.syncAttempt++;
              this.ready = false;
              this.syncing = undefined;
              if (event.status === 'closed' && event.error) this.emit({
                type: 'notice',
                message: event.error.message
              });
              this.emit({
                type: 'connection',
                status: event.status === 'closed' ? 'closed' : 'reconnecting'
              });
              if (event.status === 'closed') this.ticket = undefined;
            }
            return;
          }
          if (event.method === 'game.snapshot' && this.ready) {
            try {
              if (!isObject(event.payload)) throw Error('invalid snapshot envelope');
              // Old-room broadcasts may already have been in flight when a new table was selected.
              if (isObject(event.payload.snapshot) && event.payload.snapshot.id !== this.ticket.sessionId) return;
              this.acceptSnapshot(this.validateSnapshot(event.payload.snapshot));
            } catch (_unused) {
              this.client.protocolFailure();
            }
          } else if (event.method === 'game.notice' && isObject(event.payload) && event.payload.sessionId === this.ticket.sessionId && typeof event.payload.message === 'string') {
            this.emit({
              type: 'notice',
              message: event.payload.message.slice(0, 1000)
            });
          }
        };
        _proto.validateSnapshot = function validateSnapshot(value) {
          var _this$ticket;
          var snapshot = parseSnapshot(value);
          if (snapshot.id !== ((_this$ticket = this.ticket) == null ? void 0 : _this$ticket.sessionId) || snapshot.viewerSeat !== this.ticket.seat) throw new NetworkError('PROTOCOL', '牌桌或座位與配桌資訊不一致');
          return snapshot;
        };
        _proto.acceptSnapshot = function acceptSnapshot(snapshot, acknowledgedRequestId) {
          if (this.snapshot && snapshot.revision < this.snapshot.revision) return;
          this.snapshot = snapshot;
          this.emit({
            type: 'snapshot',
            snapshot: snapshot,
            acknowledgedRequestId: acknowledgedRequestId
          });
        };
        _proto.emit = function emit(event) {
          for (var _iterator = _createForOfIteratorHelperLoose(this.listeners), _step; !(_step = _iterator()).done;) {
            var listener = _step.value;
            listener(event);
          }
        };
        return WsGameSession;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/WsMatchmaking.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './NetworkError.ts', './validation.ts'], function (exports) {
  var _asyncToGenerator, _regeneratorRuntime, cclegacy, NetworkError, parseTicket;
  return {
    setters: [function (module) {
      _asyncToGenerator = module.asyncToGenerator;
      _regeneratorRuntime = module.regeneratorRuntime;
    }, function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      NetworkError = module.NetworkError;
    }, function (module) {
      parseTicket = module.parseTicket;
    }],
    execute: function () {
      cclegacy._RF.push({}, "4fc27NA+/pLMr4kr0ZX+Yet", "WsMatchmaking", undefined);

      /** Provisional service methods; replace these mappings when the backend API is agreed. */
      var WsMatchmaking = exports('WsMatchmaking', /*#__PURE__*/function () {
        function WsMatchmaking(client, tickets) {
          this.client = client;
          this.tickets = tickets;
        }
        var _proto = WsMatchmaking.prototype;
        _proto.match = /*#__PURE__*/function () {
          var _match = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(request, signal) {
            var result, ticket;
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  if (!(signal != null && signal.aborted)) {
                    _context.next = 2;
                    break;
                  }
                  throw new NetworkError('ABORTED', '配桌已取消');
                case 2:
                  _context.next = 4;
                  return this.client.connect();
                case 4:
                  _context.next = 6;
                  return this.client.request('match.create', request, {
                    signal: signal
                  });
                case 6:
                  result = _context.sent;
                  ticket = parseTicket(result, this.client.transport.endpoint);
                  this.tickets.save(ticket);
                  return _context.abrupt("return", ticket);
                case 10:
                case "end":
                  return _context.stop();
              }
            }, _callee, this);
          }));
          function match(_x, _x2) {
            return _match.apply(this, arguments);
          }
          return match;
        }();
        _proto.findResumable = /*#__PURE__*/function () {
          var _findResumable = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
            var saved, result, ticket;
            return _regeneratorRuntime().wrap(function _callee2$(_context2) {
              while (1) switch (_context2.prev = _context2.next) {
                case 0:
                  saved = this.tickets.read();
                  if (saved) {
                    _context2.next = 3;
                    break;
                  }
                  return _context2.abrupt("return", null);
                case 3:
                  _context2.next = 5;
                  return this.client.connect();
                case 5:
                  _context2.prev = 5;
                  _context2.next = 8;
                  return this.client.request('match.resume', {
                    sessionId: saved.sessionId,
                    resumeToken: saved.resumeToken
                  });
                case 8:
                  result = _context2.sent;
                  if (!(result === null)) {
                    _context2.next = 11;
                    break;
                  }
                  return _context2.abrupt("return", null);
                case 11:
                  ticket = parseTicket(result, this.client.transport.endpoint);
                  this.tickets.save(ticket);
                  return _context2.abrupt("return", ticket);
                case 16:
                  _context2.prev = 16;
                  _context2.t0 = _context2["catch"](5);
                  if (!(_context2.t0 instanceof NetworkError && ['SESSION_NOT_FOUND', 'UNAUTHORIZED'].includes(_context2.t0.code))) {
                    _context2.next = 21;
                    break;
                  }
                  this.tickets.clear();
                  return _context2.abrupt("return", null);
                case 21:
                  throw _context2.t0;
                case 22:
                case "end":
                  return _context2.stop();
              }
            }, _callee2, this, [[5, 16]]);
          }));
          function findResumable() {
            return _findResumable.apply(this, arguments);
          }
          return findResumable;
        }();
        return WsMatchmaking;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/WsRecordService.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './validation.ts'], function (exports) {
  var _asyncToGenerator, _regeneratorRuntime, cclegacy, parseRecords;
  return {
    setters: [function (module) {
      _asyncToGenerator = module.asyncToGenerator;
      _regeneratorRuntime = module.regeneratorRuntime;
    }, function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      parseRecords = module.parseRecords;
    }],
    execute: function () {
      cclegacy._RF.push({}, "2137e2tCo1Fdou79EXnK8yK", "WsRecordService", undefined);
      var WsRecordService = exports('WsRecordService', /*#__PURE__*/function () {
        function WsRecordService(client, tickets) {
          this.client = client;
          this.tickets = tickets;
        }
        var _proto = WsRecordService.prototype;
        _proto.list = /*#__PURE__*/function () {
          var _list = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
            var ticket;
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  ticket = this.tickets.read();
                  if (ticket) {
                    _context.next = 3;
                    break;
                  }
                  return _context.abrupt("return", []);
                case 3:
                  _context.next = 5;
                  return this.client.connect();
                case 5:
                  _context.t0 = parseRecords;
                  _context.next = 8;
                  return this.client.request('records.list', {
                    sessionId: ticket.sessionId,
                    resumeToken: ticket.resumeToken
                  });
                case 8:
                  _context.t1 = _context.sent;
                  return _context.abrupt("return", (0, _context.t0)(_context.t1));
                case 10:
                case "end":
                  return _context.stop();
              }
            }, _callee, this);
          }));
          function list() {
            return _list.apply(this, arguments);
          }
          return list;
        }();
        return WsRecordService;
      }());
      cclegacy._RF.pop();
    }
  };
});

(function(r) {
  r('virtual:///prerequisite-imports/main', 'chunks:///_virtual/main'); 
})(function(mid, cid) {
    System.register(mid, [cid], function (_export, _context) {
    return {
        setters: [function(_m) {
            var _exportObj = {};

            for (var _key in _m) {
              if (_key !== "default" && _key !== "__esModule") _exportObj[_key] = _m[_key];
            }
      
            _export(_exportObj);
        }],
        execute: function () { }
    };
    });
});