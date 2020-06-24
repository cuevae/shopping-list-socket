import * as msg from '../lib/shopping-list-comms/messages';

//var fetch = require('node-fetch');
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const axios = require('axios').default;

const STORE_API_URL = 'http://192.168.1.81:3000/';
const CONNECTION = 'connection';
const DISCONNECT = 'disconnect';
const SL_NSP = '/shopping_lists';


/**
 * 
 * @param action 
 * @param data 
 */
function emitToAllClients(action, data)
{
    console.log('emitting ' + action);
    io.sockets.emit(action, data);
}

/**
 * 
 */
function retrieve_items()
{

    //get the latest shopping list created and its items
    return fetch(STORE_API_URL + 'shopping_lists?select=*,shopping_lists_items(*)&limit=1&order=id.desc&shopping_lists_items.order=item_name.asc')
    .then(
      (response, ...rest) => {
        if(response.status != 200){
            throw 'Could not retrieve items';
        }
        return response.json();
      }
    ).then(
        (data, ...rest) => {
            let array_of_items = data[0];
            emitToAllClients( msg.CLIENT_RELOAD_ITEMS, array_of_items );
        }
    )
    .catch( (error) => { console.log(error)} )
}

/**
 * 
 * @param item 
 */
function add_item(item)
{

    fetch(
        STORE_API_URL + 'shopping_lists_items',
        {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Prefer: 'return=representation'
            },
            body: JSON.stringify(
                {
                    sl_id: item.sl_id,
                    item_name: item.name,
                    item_qty: item.qty && item.qty > 0 ? item.qty : 1
                }
            )
        }
    )
    .then(
        (response) => {
            if(response.status !== 201){
                throw 'Item could not be added';
            }
            let data = response.json();
            return data;
        }
    )
    .then(
        (data) => {
            let newItem = data[0];

            console.log('confirming item added');
            console.log(newItem);
            //socket.to(socket.id).emit(ITEM_ADDED, newItem);
            //socket.emit

        }
    )
    .catch(
        //TODO: handle error
        (error) => {console.log(error)}
    )

}

async function available_shopping_lists(){
    try{

        const result = await axios.get(STORE_API_URL + 'shopping_lists?select=*&order=id.desc');
        return result.data;

    } catch (error) {

        console.error(error);
    }
}

/**
 * NAMESPACES
 */

//Shopping Lists Namespace
const sl_nsp = io.of(SL_NSP);
sl_nsp.on(CONNECTION, async function( socket: SocketIO.Socket ){

    //TODO: Replace with proper logging tool
    console.log('User connected to ' + SL_NSP + ' with id: ' + socket.id );

    console.log('emitting shopping lists');
    socket.emit('CLIENT_AVAILABLE_SHOPPING_LISTS', await available_shopping_lists());
    
});

io.on(CONNECTION, (socket: SocketIO.Socket) => {

    console.log('a user has connected to / with id: ' + socket.id);

});

/**
 * 
 */
http.listen(3333, () => {
    console.log('listening on *:3333');
});