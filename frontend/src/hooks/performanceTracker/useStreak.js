import { useEffect, useState } from "react"
import axiosInstance from "../../instances/Axiosinstances";


const useStreak = (authorId) => {

    const [streakData, setStreakData] = useState({});
    const [streakLoader, setStreakLoader] = useState(false);

    const getStreakDetails = async() => {
        try{
            setStreakLoader(true)
            const res = await axiosInstance.get(`/bytes/performanceTrack/streak?authorId=${authorId}`);

            if(res.status===200)
            {
                setStreakData(res.data.streak);

            }

        }
        catch(err)
        {
            console.log("error getting streak details", err.message);
        }
        finally{
            setStreakLoader(false)
        }
    }

    useEffect(()=> {
        getStreakDetails();
    }, [authorId])

    return {streakData, streakLoader, getStreakDetails}
}

export default useStreak;