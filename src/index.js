"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var msg = require("../lib/shopping-list-comms/messages");
//var fetch = require('node-fetch');
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var axios = require('axios')["default"];
var STORE_API_URL = 'http://192.168.1.81:3000/';
var CONNECTION = 'connection';
var DISCONNECT = 'disconnect';
var SL_NSP = '/shopping_lists';
/**
 *
 * @param action
 * @param data
 */
function emitToAllClients(action, data) {
    console.log('emitting ' + action);
    io.sockets.emit(action, data);
}
/**
 *
 */
function retrieve_items() {
    //get the latest shopping list created and its items
    return fetch(STORE_API_URL + 'shopping_lists?select=*,shopping_lists_items(*)&limit=1&order=id.desc&shopping_lists_items.order=item_name.asc')
        .then(function (response) {
        var rest = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            rest[_i - 1] = arguments[_i];
        }
        if (response.status != 200) {
            throw 'Could not retrieve items';
        }
        return response.json();
    }).then(function (data) {
        var rest = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            rest[_i - 1] = arguments[_i];
        }
        var array_of_items = data[0];
        emitToAllClients(msg.CLIENT_RELOAD_ITEMS, array_of_items);
    })["catch"](function (error) { console.log(error); });
}
/**
 *
 * @param item
 */
function add_item(item) {
    fetch(STORE_API_URL + 'shopping_lists_items', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Prefer: 'return=representation'
        },
        body: JSON.stringify({
            sl_id: item.sl_id,
            item_name: item.name,
            item_qty: item.qty && item.qty > 0 ? item.qty : 1
        })
    })
        .then(function (response) {
        if (response.status !== 201) {
            throw 'Item could not be added';
        }
        var data = response.json();
        return data;
    })
        .then(function (data) {
        var newItem = data[0];
        console.log('confirming item added');
        console.log(newItem);
        //socket.to(socket.id).emit(ITEM_ADDED, newItem);
        //socket.emit
    })["catch"](
    //TODO: handle error
    function (error) { console.log(error); });
}
function available_shopping_lists() {
    return __awaiter(this, void 0, void 0, function () {
        var response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios.get(STORE_API_URL + 'shopping_lists?select=*&order=id.desc')
                        //console.log(response);
                    ];
                case 1:
                    response = _a.sent();
                    //console.log(response);
                    return [2 /*return*/, response];
                case 2:
                    error_1 = _a.sent();
                    console.error(error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * NAMESPACES
 */
//Shopping Lists Namespace
var sl_nsp = io.of(SL_NSP);
sl_nsp.on(CONNECTION, function (socket) {
    //TODO: Replace with proper logging tool
    console.log('User connected to ' + SL_NSP + ' with id: ' + socket.id);
    var res = available_shopping_lists();
    console.log(res);
    //socket.emit('AVAILABLE_SHOPPING_LISTS', 'available_shopping_lists');
});
/**
 *
 */
// io.on(CONNECTION, (socket) => {
//     console.log('a user has connected with id: ' + socket.id);
//     socket.on(DISCONNECT, () => {
//         console.log('a user has disconnected with id: ' + socket.id);
//     });
//     socket.on(LIST_ITEMS, () => {
//         console.log(LIST_ITEMS + ' received')
//         retrieve_items();
//     })
//     socket.on(ADD_ITEM, (item) => {
//         add_item(socket, item);
//     })
// });
io.on(CONNECTION, function (socket) {
    console.log('a user has connected with id: ' + socket.id);
});
/**
 *
 */
http.listen(3333, function () {
    console.log('listening on *:3333');
});
