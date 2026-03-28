import supabase from "../config/supabase_client";

const home = () => {
    console.log(supabase)


    return (
        <div className="page home">
            <h1>home</h1>

        </div>
    )
}

export default home