import { 
  createContext, 
  Dispatch, 
  ReactNode, 
  SetStateAction, 
  useContext,
  useState 
} from 'react';
import { Profile, Post, PublicationStats } from '@generated/types'

export type Reaction = "Comment" | "Mirror" | "Collect" | "Like" | "Follow" | ""
export type JoinType = "AND" | "OR"

export type Filter = {
  reaction: Reaction
  publicationId?: string
  publication?: Post | undefined
  handle?: string
  joinType?: JoinType
  limit?: number
  stats?: PublicationStats
}

export interface ContextType {
    address: string | undefined;
    profiles: Profile[];
    followers: string[];
    followings: string[];
    filters: Filter[];
    recipients: string[];
    setUserAddress: Dispatch<SetStateAction<string>>;
    setProfiles: Dispatch<SetStateAction<Profile[]>>;
    setFollowers: Dispatch<SetStateAction<string[]>>;
    setFollowings: Dispatch<SetStateAction<string[]>>;
    setFilters: Dispatch<SetStateAction<Filter[]>>;
    setRecipients: Dispatch<SetStateAction<string[]>>;
  }

type Props = {
  children: ReactNode;
};
  
const AppContext = createContext<ContextType>({
  address: undefined,
  profiles: [],
  followers: [],
  followings: [],
  filters: [],
  recipients: [],
  setUserAddress: () => {},
  setProfiles: () => {},
  setFollowers: () => {},
  setFollowings: () => {},
  setFilters: () => {},
  setRecipients: () => {},
})

export function AppWrapper({ children }: Props) {
  const [address, setUserAddress] = useState("")
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [followers, setFollowers] = useState<string[]>([])
  const [followings, setFollowings] = useState<string[]>([])
  const [filters, setFilters] = useState<Filter[]>([]);
  const [recipients, setRecipients] = useState<string[]>([]);

  const value = {
    address,
    profiles,
    followers,
    followings,
    filters,
    recipients,
    setUserAddress,
    setProfiles,
    setFollowers,
    setFollowings,
    setFilters,
    setRecipients
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => {
  return useContext(AppContext)
}
  
export default AppContext