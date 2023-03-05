//~---------------------------------------------------------------------------//
//                        _      _                 _   _                      //
//                    ___| |_ __| |_ __ ___   __ _| |_| |_                    //
//                   / __| __/ _` | '_ ` _ \ / _` | __| __|                   //
//                   \__ \ || (_| | | | | | | (_| | |_| |_                    //
//                   |___/\__\__,_|_| |_| |_|\__,_|\__|\__|                   //
//                                                                            //
//  File      : starfield.js                                                  //
//  Project   : starfield                                                     //
//  Date      : Aug 25, 2019                                                  //
//  License   : GPLv3                                                         //
//  Author    : stdmatt <stdmatt@pixelwizards.io>                             //
//  Copyright : stdmatt 2019, 2020, 2023                                      //
//                                                                            //
//  Description :                                                             //
//                                                                            //
//---------------------------------------------------------------------------~//


//----------------------------------------------------------------------------//
// Constants                                                                  //
//----------------------------------------------------------------------------//
//------------------------------------------------------------------------------
__SOURCES = [
    "/modules/demolib/modules/external/chroma.js",
    "/modules/demolib/modules/external/gif.js/gif.js",

    "/modules/demolib/source/demolib.js",
];

//------------------------------------------------------------------------------
const STARS_COUNT     =  100;
const STAR_MIN_SIZE   =    0;
const STAR_MAX_SIZE   =    4;
const STAR_MIN_SPEED  =   50;
const STAR_MAX_SPEED  =  900;
const TRAIL_MIN_SIZE  =    0;
const TRAIL_MAX_SIZE  =   30;
const TRAIL_MIN_ALPHA =    0;
const TRAIL_MAX_ALPHA =  0.5;


//----------------------------------------------------------------------------//
// Types                                                                      //
//----------------------------------------------------------------------------//
//------------------------------------------------------------------------------
class Star
{
    constructor()
    {
        this._reset();
    }

    _reset()
    {
        const GAP = 50;

        const canvas_w = get_canvas_width ();
        const canvas_h = get_canvas_height();

        const left_side   = -(canvas_w * 0.5) + GAP;
        const right_side  = +(canvas_w * 0.5) - GAP;
        const top_side    = -(canvas_h * 0.5) + GAP;
        const bottom_side = +(canvas_h * 0.5) - GAP;

        const random_x = random_int(left_side, right_side);
        const random_y = random_int(top_side,  bottom_side);

        this.start_pos = make_vec2(random_x, random_y);
        this.curr_pos  = make_vec2(random_x, random_y);

        let v          = sub_vec2(this.start_pos, make_vec2());
        this.angle     = Math.atan2(v.y, v.x);
        this.distance  = 0;
        this.direction = make_vec2_unit(v);
        this.speed     = STAR_MIN_SPEED;
        this.size      = 0;

        this.trail_size  = 0;
        this.trail_alpha = 0;

        this.speed_modifier = random_float(1, 2);
    }

    update(dt)
    {
        this.distance = distance_vec2(this.start_pos, this.curr_pos);
        this.speed    = map_values(
            this.distance,
            0,              max_distance,
            STAR_MIN_SPEED, STAR_MAX_SPEED
        ) * this.speed_modifier;

        this.size = map_values(
            this.speed,
            STAR_MIN_SPEED, STAR_MAX_SPEED,
            STAR_MIN_SIZE,  STAR_MAX_SIZE
        );

        this.trail_size = map_values(
            this.speed,
            STAR_MIN_SPEED, STAR_MAX_SPEED,
            TRAIL_MIN_SIZE, TRAIL_MAX_SIZE
        );

        this.trail_alpha = map_values(
            this.trail_size,
            TRAIL_MIN_SIZE,  TRAIL_MAX_SIZE,
            TRAIL_MIN_ALPHA, TRAIL_MAX_ALPHA
        );

        this.curr_pos.x += this.speed * Math.cos(this.angle) * dt;
        this.curr_pos.y += this.speed * Math.sin(this.angle) * dt;

        const canvas_w = get_canvas_width ();
        const canvas_h = get_canvas_height();

        const left_side   = -(canvas_w * 0.5);
        const right_side  = +(canvas_w * 0.5);
        const top_side    = -(canvas_h * 0.5);
        const bottom_side = +(canvas_h * 0.5);

        if(this.curr_pos.x < left_side  ||
           this.curr_pos.x > right_side ||
           this.curr_pos.y < top_side   ||
           this.curr_pos.y > bottom_side)
        {
            this._reset();
        }
    }

    draw()
    {
        const v = sub_vec2(this.curr_pos, mul_vec2(this.direction, this.trail_size));
        fill_circle(this.curr_pos.x, this.curr_pos.y, this.size);

        // @perf(stdmatt): [Using chroma just to change the alpha... at 2022-03-04, 14:41
        set_canvas_stroke(COLOR.alpha(this.trail_alpha));
        draw_line(this.curr_pos.x, this.curr_pos.y, v.x, v.y);
    }
};


//----------------------------------------------------------------------------//
// Variables                                                                  //
//----------------------------------------------------------------------------//
//------------------------------------------------------------------------------
let stars        = [];
let COLOR        = null;
let max_distance = 0;


//----------------------------------------------------------------------------//
// Setup / Draw                                                               //
//----------------------------------------------------------------------------//
//------------------------------------------------------------------------------
function setup_standalone_mode()
{
    return new Promise((resolve, reject)=>{
        demolib_load_all_scripts(__SOURCES).then(()=> { // Download all needed scripts.
            // Create the standalone canvas.
            const canvas = document.createElement("canvas");

            canvas.width            = window.innerWidth;
            canvas.height           = window.innerHeight;
            canvas.style.position   = "fixed";
            canvas.style.left       = "0px";
            canvas.style.top        = "0px";
            canvas.style.zIndex     = "-100";

            document.body.appendChild(canvas);

            // Setup the listener for gif recording.
            gif_setup_listeners();

            resolve(canvas);
        });
    });
}

//------------------------------------------------------------------------------
function setup_common(canvas)
{
    COLOR = chroma("white")
    max_distance = Math.max(canvas.width, canvas.height);

    set_main_canvas(canvas);
    set_canvas_fill("white");

    set_random_seed       (null);
    install_input_handlers(canvas);

    for(let i = 0; i < STARS_COUNT; ++i) {
        stars.push(new Star());
    }

    translate_canvas_to_center();
    start_draw_loop(draw);
}



//------------------------------------------------------------------------------
function demo_main(user_canvas)
{
    if(!user_canvas) {
        setup_standalone_mode().then((canvas)=>{
            setup_common(canvas);
        });
    } else {
        canvas = user_canvas;
        setup_common();
    }

}

//------------------------------------------------------------------------------
function draw(dt)
{
    clear_canvas();

    begin_draw();
        for(let i = 0; i < stars.length; ++i) {
            stars[i].update(dt);
            stars[i].draw   ();
        }
    end_draw();
}
