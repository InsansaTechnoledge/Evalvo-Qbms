import Pagelinks from './utils/Pagelinks'
import { UserProvider } from './contexts/UserContext';

const App = () => {
  return (
    <main>
      <UserProvider>
        <Pagelinks/>
      </UserProvider>
      
    </main>
  )
}

export default App
