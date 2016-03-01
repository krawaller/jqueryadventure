/* ############### OVERVIEW ############

This file contains all the logic for the amazing Newton Super Adventure game! The
game is defined in a function that will run when the document is fully loaded.

This function can be seen as divided into 3 parts:

1. Define a bunch of functions:
	- selectedOption
	- resetGame
	- restoreGame
	- renderCurrentScene
2. Define variables:
	- state
	- scenes
3. Finally runs a bit of initialization code

#######################################*/



$(document).ready(function(){

	/* ---------- SELECTEDOPTION FUNCTION -------
	This is the callback for when a player clicks a link button. That button has all
	link data as attributes, so we need to get that and then mutate the state var 
	according to what happens. Finally we must save the updated state and rerender!
	--------------------------------------------*/
	function selectedOption(e){
		var nextSceneId = $(this).attr("to");

		// picked up an item
		var gain = $(this).attr("gain");
		if (gain){
			state.inventory[gain] = 1;
		}

		// lost an item
		var lose = $(this).attr("lose");
		if (lose){
			delete state.inventory[lose];
		}

		// took damage (or got health if damage is negative)
		var damage = $(this).attr("damage");
		if (damage){
			state.health = Math.max(0,state.health - damage);
			if (state.health<1){
				nextSceneId = "graveyard";
			}
		}

		// move to new scene
		if (nextSceneId){
			state.sceneId = nextSceneId;
		}

		// update and save
		renderCurrentScene();
		localStorage.setItem("NEWTONGAMESTATE",JSON.stringify(state));
	}


	/* ------------- RESETGAME FUNCTION ----------
	This is the callback for the reset button. This method is also called from
	restoreGame if there was no save data to get. It sets up the state variable
	with initial data.
	--------------------------------------------*/
	function resetGame(){
		state = {
			sceneId:"start",
			health:10,
			inventory:{}
		};
		renderCurrentScene();
	}


	/* -------------- RESTOREGAME FUNCTION --------
	This is called at app start (at the very bottom of this file). It tries to
	read saved data from localstorage, and if it doesn't find anything it'll
	set initial data by calling resetGame.
	---------------------------------------------*/
	function restoreGame(){
		var savestring = localStorage.getItem("NEWTONGAMESTATE");
		if (!savestring){
			resetGame();
		} else {
			state = JSON.parse(savestring);
			renderCurrentScene();
		}
	}


	/* ------- RENDERCURRENTSCENE FUNCTION --------
	This function updates the UI, so it is called whenever something has
	changed. It reads from the state variable to find out which scene to
	render, and which links from that scene that should be shown (as some)
	links might only show if the player has/hasn't got a particular item.
	---------------------------------------------*/
	function renderCurrentScene(){
		var scene = scenes[ state.sceneId ];

		// Draw basic stuff
		$(".title").text(scene.title);
		$(".flavourtext").text(scene.text);
		$(".health").text(state.health);
		
		// Draw inventory
		$(".inventory").empty();
		for(var item in state.inventory){
			$("<span>"+item+"</span>").appendTo(".inventory")
		}

		// Draw all links (buttons)
		$(".links").empty();
		for(var i=0; i<scene.links.length;i++ ){
			var link = scene.links[i];

			// check if player fulfills eventual "ifhas" item condition in link
			var ifhasOK = !link.ifhas || state.inventory[link.ifhas];
			
			// check if player fulfills eventual "ifhasnt" item condition in link
			var ifhasntOK = !link.ifhasnt || !state.inventory[link.ifhasnt];
			
			// draw link if all conditions fulfilled
			if (ifhasOK && ifhasntOK){
				$("<button>"+link.text+"</button>")
					.attr(link) // clever trick to put everything from link obj onto button node
					.appendTo(".links");
			}
		}
	}


	/* ------------------ THE STATE VARIABLE ------------------- 
	This variable will hold the current state of the player:
	{
		sceneId: 'start', // id of the current scene
		health: 10,       // integer of how much health we have
		inventory: {      // an object holding our inventory
			sword: 1,     // the keys are the items we have, the values don't mean anything (just have to be truthy)
			key: 1
		}
	}
	The state variable is initially set in the `resetGame` function,
	and then mutated in `selectedOption` as the player does stuff.
	----------------------------------------------------------*/
	var state;


	/* ------------------ THE SCENES VARIABLE ---------------
	The scenes variable holds the adventure data. It is an object where the keys are ID:s for
	individual scenes, and the value for each scene is an object describing it. They look like this:
	{
		title: "txt",    // shown as a headline for the scene
		text: "bla bla", // the main flavour text for the scene
		links: [         // an array of link objects, each look like this:
			{
				to: "road",    // name of scene to link to (if any)
				damage: 4,     // value to deduct from player health
				gain: "sword", // item to add to inventory
				ifhas: "key",  // item player must have for this link to show
				ifhasnt: "key" // item player mustn't have for this link to show
			}
		]
	}
	-------------------------------------------------------- */

	var scenes = {
		graveyard: {
			title: "FAIL!!",
			text: "You died horribly. Your family would be so ashamed of how crappy you are.",
			links: []
		},
		start: {
			title: "The beginning",
			text: "Let's embark on a terribly exciting adventure woo! Where do you want to go?",
			links: [
				{text: "West",to:"deadend"} ,
				{text:"East",to:"road"},
				{text:"Pick up sword",gain:"sword",ifhasnt:"sword"}
			]
		},
		deadend: {
			title: "End of the road",
			text: "The road ends, nothing here. Boooring!",
			links: [ {text:"Go back", to: "start" } ]
		},
		road: {
			title: "Trudging on",
			text: "You are on a dusty road. There is a snake by the road",
			links: [
				{text:"Pet snake", damage: 3},
				{text:"Chop snake", ifhas: "sword", to: "roaddeadsnake"}
			]
		},
		roaddeadsnake: {
			title: "Trudging on a dead snake",
			text: "You are on a dusty road with a dead snake on it.",
			links: []
		}
	};

    /* ---------------- INITIALIZING THE GAME -----------------
	To kick the game off, all we have to do is set event listeners for Reset and links,
	and then call restoreGame()!
    ----------------------------------------------------------*/

	$(".links").on("click","button",selectedOption);

	$(".reset").on("click",resetGame);

	restoreGame();
});