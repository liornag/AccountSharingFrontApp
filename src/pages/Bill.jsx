import { useParams } from 'react-router-dom';

function UserProfile() {
  const { billid } = useParams(); // Destructure to get the userId parameter

  return (
    <div>
      <h1>User Profile for ID: {billid}</h1>
      {/* Fetch user data based on userId */}
    </div>
  );
}

export default UserProfile;