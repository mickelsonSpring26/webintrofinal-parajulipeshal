var currentUser= ""
export const SetCurrentUser = (newUsername)=>{
    if(currentUser !== "" && newUsername !=="")
       { console.log("cannot signin user if already signin")
        return false;
       }
           currentUser= newUsername;
           return true;
}

export const GetCurrentUser = ()=>{
   return currentUser;
}