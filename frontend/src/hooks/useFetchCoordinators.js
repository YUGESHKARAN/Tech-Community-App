import React, {useState,useEffect} from 'react';
import axiosInstance from '../instances/Axiosinstances';

function useFetchCoordinators(role) {
    const [coordinators, setCoordinators] = useState([]);

    const fetchCoordinators = async () => {
        try{
            const response = await axiosInstance.get(`/blog/author/authoreByRole/${role}`)
            if (response.status === 200){
                setCoordinators(response.data.authors);
            }

        }
        catch(err){
            console.log("error", err.message);
        }
    }

    useEffect(()=>{
        if (role) fetchCoordinators();
    }, [role]);
  return {coordinators, fetchCoordinators};

}

export default useFetchCoordinators