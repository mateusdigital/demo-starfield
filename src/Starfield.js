//~---------------------------------------------------------------------------//
//                        _      _                 _   _                      //
//                    ___| |_ __| |_ __ ___   __ _| |_| |_                    //
//                   / __| __/ _` | '_ ` _ \ / _` | __| __|                   //
//                   \__ \ || (_| | | | | | | (_| | |_| |_                    //
//                   |___/\__\__,_|_| |_| |_|\__,_|\__|\__|                   //
//                                                                            //
//  File      : Starfield.js                                                  //
//  Project   : stdmatt-demos                                                 //
//  Date      : 17 Jul, 2019                                                  //
//  License   : GPLv3                                                         //
//  Author    : stdmatt <stdmatt@pixelwizards.io>                             //
//  Copyright : stdmatt - 2019                                                //
//                                                                            //
//  Description :                                                             //
//   Just a simple starfield simulation...                                    //
//---------------------------------------------------------------------------~//

//----------------------------------------------------------------------------//
// Constants                                                                  //
//----------------------------------------------------------------------------//
const STARS_COUNT     =  100;
const STAR_MIN_SIZE   =    0;
const STAR_MAX_SIZE   =    4;
const STAR_MIN_SPEED  =   50;
const STAR_MAX_SPEED  =  900;
const MAX_DISTANCE    =  200;
const TRAIL_MIN_SIZE  =    0;
const TRAIL_MAX_SIZE  =   30;
const TRAIL_MIN_ALPHA =    0;
const TRAIL_MAX_ALPHA =  0.5;
let COLOR = chroma("white");

//----------------------------------------------------------------------------//
// Types                                                                      //
//----------------------------------------------------------------------------//
class Star
{
    constructor()
    {
        this._reset();
    }

    _reset()
    {
        const GAP = 50;
        this.startPos = Vector_Create(
            Math_RandomInt(Canvas_Edge_Left + GAP,  Canvas_Edge_Right  - GAP),
            Math_RandomInt(Canvas_Edge_Top  + GAP,  Canvas_Edge_Bottom - GAP)
        );
        this.currPos = Vector_Copy(this.startPos);

        let v = Vector_Sub(this.startPos, Vector_Create(0, 0));
        this.angle     = Math.atan2(v.y, v.x);
        this.distance  = 0;
        this.direction = Vector_Unit(v);
        this.speed     = STAR_MIN_SPEED;
        this.size      = 0;

        this.trailSize  = 0;
        this.trailAlpha = 0;
    }

    update(dt)
    {
        this.distance = Vector_Distance(this.startPos, this.currPos);

        this.speed = Math_Map(
            this.distance,
            0,              MAX_DISTANCE,
            STAR_MIN_SPEED, STAR_MAX_SPEED
        ) * speed_modifier;

        this.size = Math_Map(
            this.speed,
            STAR_MIN_SPEED, STAR_MAX_SPEED,
            STAR_MIN_SIZE,  STAR_MAX_SIZE
        );

        this.trailSize = Math_Map(
            this.speed,
            STAR_MIN_SPEED, STAR_MAX_SPEED,
            TRAIL_MIN_SIZE, TRAIL_MAX_SIZE
        );

        this.trailAlpha = Math_Map(
            this.trailSize,
            TRAIL_MIN_SIZE,  TRAIL_MAX_SIZE,
            TRAIL_MIN_ALPHA, TRAIL_MAX_ALPHA
        );


        this.currPos.x += this.speed * Math_Cos(this.angle) * dt;
        this.currPos.y += this.speed * Math_Sin(this.angle) * dt;

        if(this.currPos.x < Canvas_Edge_Left  ||
           this.currPos.x > Canvas_Edge_Right ||
           this.currPos.y < Canvas_Edge_Top   ||
           this.currPos.y > Canvas_Edge_Bottom)
        {
            this._reset();
        }
    }




    draw()
    {
        Canvas_FillCircle(this.currPos.x, this.currPos.y, this.size);

        Canvas_SetStrokeStyle(COLOR.alpha(this.trailAlpha));
        let v = Vector_Sub(this.currPos, Vector_Mul(this.direction, this.trailSize));
        Canvas_DrawLine(this.currPos.x, this.currPos.y, v.x, v.y);
    }


}; // class Star

//----------------------------------------------------------------------------//
// Variables                                                                  //
//----------------------------------------------------------------------------//
let stars               = [];
let speed_modifier      = 0;
let time_to_create_star = 0;


//----------------------------------------------------------------------------//
// Setup / Draw                                                               //
//----------------------------------------------------------------------------//
//------------------------------------------------------------------------------
function Setup()
{
}

//------------------------------------------------------------------------------
function Draw(dt)
{
    Canvas_ClearWindow();
    Canvas_SetFillStyle("white");


    let mouse_distance = Math_Distance(Mouse_World_X, Mouse_World_Y, 0, 0);
    speed_modifier     = Math_Map(mouse_distance, 0, MAX_DISTANCE, 1, 1.5);

    if(stars.length < STARS_COUNT) {
        time_to_create_star -= dt;
        if(time_to_create_star < 0) {
            time_to_create_star = Math_Random(0, 0.1);
            stars.push(new Star());
        }
    }

    for(let i = 0; i < stars.length; ++i) {
        stars[i].update(dt);
        stars[i].draw();
    }
}


//----------------------------------------------------------------------------//
// Entry Point                                                                //
//----------------------------------------------------------------------------//
Canvas_Setup({
    main_title        : "Starfield",
    main_date         : "Jul 17, 2019",
    main_version      : "v1.0.0",
    main_instructions : "<br>Move your mouse closer to the edge to increase speed",
    main_link: "<a href=\"http://stdmatt.com/demos/startfield.html\">More info</a>"
});
