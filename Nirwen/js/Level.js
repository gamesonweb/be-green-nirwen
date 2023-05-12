import Room from "./Room.js";

export default class Level {
    constructor(salle_max, salle_min, id, grid_size,room_size) {
        this.salle_max =salle_max;
        this.salle_min =salle_min;
        this.room_size =room_size;
        this.grid_size = grid_size;
        this.id = id;
        let grid = []
        for (let x = 0; x < this.grid_size; x++) {
            grid[x] = [];
            for (let y = 0; y < this.grid_size; y++) {
                grid[x][y] = null;
            }
        }
        this.grid=grid;
        this.walls=[]
        this.room=[]
        this.roomdata=[]
    }   // un level est caratérisé par une Grille contenant un nombre de salle aléatoire entre salle_max et salle_min , il possède aussi un niveau (ID) et la taille d'une salle (pour les differents calculs)
    // on va calculer (et stoker) dans cette structures les points clefs pour stockers des murs, mais aussi les salles de type ROOM , et les données d'une salle (les mesh des murs regroupé par 4) dans room data
    generate_grid() {
        // Calculer les coordonnées du centre de la grille
        const center_x = Math.floor(this.grid_size / 2);
        const center_y = Math.floor(this.grid_size / 2);
      
        // Générer un nombre aléatoire de salles compris entre salle_min et salle_max
        const nb_salles = Math.floor(Math.random() * (this.salle_max - this.salle_min + 1) + this.salle_min);
      
        // Initialiser la grille avec des 0 partout
        for (let x = 0; x < this.grid_size; x++) {
          for (let y = 0; y < this.grid_size; y++) {
            this.grid[x][y] = 0;
          }
        }
      
        // Ajouter la première salle au centre de la grille
        this.grid[center_x][center_y] = 1;
      
        // Générer les autres salles de manière aléatoire
        const visited = new Set(); // ensemble des cases visitées
        const stack = [[center_x, center_y]]; // pile des cases à visiter (DFS)
        let nb_salle_generees = 1;
      
        while (nb_salle_generees < nb_salles && stack.length > 0) {
            // Récupérer la dernière case ajoutée à la pile
            const [x, y] = stack.pop();
        
            // Visiter les cases adjacentes dans un ordre aléatoire
            const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            shuffleArray(directions);
        
            for (const [dx, dy] of directions) {
                const new_x = x + dx;
                const new_y = y + dy;
                let prob=0
                // Vérifier si la case est à l'intérieur de la grille et n'a pas déjà été visitée
                if (new_x >= 1 && new_x < this.grid_size-1 && new_y >= 1 && new_y < this.grid_size-1 && !visited.has(`${new_x},${new_y}`)) {
                // Vérifier si la configuration 2x2 ne forme pas un carré de 2x2
                    const corner1 = this.grid[x][y];
                    const corner2 = this.grid[x+dx][y+dy];
                    let corner3;
                    let corner4;
                    let corner5;
                    let corner6;
                    if (Math.abs(dx) === 1){
                        corner3 = this.grid[x][y+1];
                        corner4 = this.grid[x+dx][y+1];
                        corner5 = this.grid[x][y-1];
                        corner6 = this.grid[x+dx][y-1];
                    } 
                    else{
                        corner3 = this.grid[x+1][y];
                        corner4 = this.grid[x+1][y+dy];
                        corner5 = this.grid[x-1][y];
                        corner6 = this.grid[x-1][y+dy];
                    }
                    if ((corner1 + corner2 + corner3 + corner4 !== 3)&&(corner1 + corner2 + corner5 + corner6 !== 3)) {
                        visited.add(`${new_x},${new_y}`);
                    
                        prob=prob+0.2
                        // Ajouter une salle avec une certaine probabilité
                        if (Math.random() < 1-prob) {
                            this.grid[new_x][new_y] = 1;
                            nb_salle_generees++;
                            stack.push([new_x, new_y]);
                        }
        
                        // Sortir de la boucle si on a atteint le nombre de salles souhaité
                        if (nb_salle_generees >= nb_salles) {
                            break;
                        }
                    }
                }
            }
        }
        console.log(nb_salle_generees)
    }

    build_level(){ //On va construire ici un tableau qui va nous permettre la constructions des murs respective a chaque salle
        let index_wall=0
        let walls=[]
        const center = Math.floor(this.grid_size / 2); //On prend de la grille comme le centre de la base de calcul (0,0)
        for (let x = 0; x < this.grid_size; x++) {
            for (let y = 0; y < this.grid_size; y++) {
                if (this.grid[x][y] !== 0){
                    let center_room_x=(y-center)*this.room_size;        //calcul du centre d'une pièce (en X)
                    let center_room_z=((-1)*(x-center))*this.room_size; //calcul du centre d'une pièce (en Z)
                    let x1= center_room_x + this.room_size/2;           //calcul du centre du mur du haut pièce (en X)
                    let x2= center_room_x - this.room_size/2;           //calcul du centre du mur du bas (en X)
                    let x_c= center_room_x;                             //calcul du centre des mur lateraux (en X)
                    let z1= center_room_z + this.room_size/2;           //calcul du centre du mur du haut pièce (en Z)
                    let z2= center_room_z - this.room_size/2;           //calcul du centre du mur du bas (en Z)
                    let z_c= center_room_z;                             //calcul du centre du mur du haut pièce (en Z)
                    let doors=[];                                       //tableau des portes a afficher dans la salle
                    if (this.grid[x-1][y] === 1){
                        doors.push("top")
                    }
                    if (this.grid[x+1][y] === 1){
                        doors.push("bottom")
                    }
                    if (this.grid[x][y+1] === 1){
                        doors.push("right")
                    }
                    if (this.grid[x][y-1] === 1){
                        doors.push("left")
                    }
                    console.log(doors)
                    let tmp =create_murs(this.room_size,x1,x2,x_c,z1,z2,z_c,index_wall,doors);  //on va simplifier les données pour creer un tableau que l'on va mettre dans notre main pour creer des murs
                    tmp.forEach(m => {
                        walls.push(m)
                    });
                    index_wall=index_wall+4
                }
            }
        }

        this.walls=walls
        let tmp=[]
        let tmp_bis=[]
        let rooms=[]

        for (let index = 0; index < walls.length; index++) {
            tmp.push(walls[index])
            if(walls[index][2] %4==3 && index !==0){
                tmp_bis.push(tmp)
                tmp=[]
            }  
        }
        this.roomdata=tmp_bis;             //creations du regroupement de 4 murs 
        tmp_bis.forEach(element => {    //creations des differentes room avec le regroupement de 4 murs 
            if (element[2][0]===0 && element[0][1]===0){
                rooms.push(new Room(element,rooms.length,[],[],true,true))  //si c'est la salle de départ alors il n'y a pas de monstres
            }
            else {
                rooms.push(new Room(element,rooms.length,[],[],false,false)) //sinon il y a des monstres
            }
        });
        this.room=rooms;
    }

    randomize_ennemy_spawn(){       //affecte au tableau d'ennemies aleatoire une piece 
        this.room.forEach(element => {
            if (element.clear_state==false){
                element.random_ennemies()
            }
        });
    }
}

function create_murs(room_size,x1,x2,x_c,z1,z2,z_c,index_wall,doors){
    // fonction qui Parse les données et les simplifie
    let walls=[]
    let x=0;
    let z=0;
    let rotation = false;
    for (let i = 0; i < 4; i++) {
        let door=false
        if (i===0){
            x=x1;
            z=z_c;
            if (doors.includes("right")){
                door=true
            }
        }
        if (i===1){
            x=x2;
            z=z_c;
            if (doors.includes("left")){
                door=true
            }
        }
        if (i===2){
            x=x_c;
            z=z1;
            rotation=true;
            if (doors.includes("top")){
                door=true
            }
        }
        if (i===3){
            x=x_c;
            z=z2;
            rotation=true;
            if (doors.includes("bottom")){
                door=true
            }
        }
        let wall= [x,z,index_wall+i,rotation,room_size,door]
        walls.push(wall);
    }
    return walls
}

// Fonction utilitaire pour mélanger un tableau aléatoirement
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}   