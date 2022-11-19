import apolloClient from 'src/apollo'
import { WHO_COLLECTED, GET_COMMENTS, GET_PUBLICATION } from 'src/graphql/Queries/Publications';
import { GET_PROFILES } from 'src/graphql/Queries/Profile';
import { Filter } from './AppContext'
import { DocumentNode } from 'graphql';

type Variables = {
    [key: string]: {
        [key: string]: string | null,
    },
}

const queryFunction = async (query: DocumentNode, variables: Variables) => {
    return await apolloClient.query({
        query: query,
        variables: variables,
        fetchPolicy: 'no-cache',
    })
}

export const Filterer = async(filters: Filter[]): Promise<Array<string>> => {
    let addresses: Array<string> = [];

    const executeFilter = filters.map(async (filter) => {
        let query: DocumentNode
        let variables: Variables = {}

        let cursor = "{\"offset\":0}"

        if (filter.reaction === 'Collect') {
            query = WHO_COLLECTED
            variables = {
                request: {
                    publicationId: filter.publicationId,
                    cursor: cursor,
                }
            }
        } else if (filter.reaction === 'Mirror') {
            query = GET_PROFILES
            variables = {
                request: {
                    whoMirroredPublicationId: filter.publicationId,
                    cursor: cursor,
                }
            }
        } else if (filter.reaction === 'Comment') {
            query = GET_COMMENTS
            variables = {
                request: {
                    commentsOf: filter.publicationId,
                    cursor: cursor,
                },
                reactionRequest: null!
            }
        } else {
            query = GET_PUBLICATION
            variables = {
                request: {
                    publicationId: filter.publicationId,
                    cursor: cursor,
                },
                reactionRequest: {
                    reaction: 'UPVOTE'
                }
            }
        }

        if (filter.reaction !== "") {
            let allAddresses: any
            
            if (filter.reaction === 'Collect') {
                const totalCount = (await queryFunction(query, variables))?.data?.whoCollectedPublication?.pageInfo?.totalCount
                let count = 0

                let _addresses: Array<any> = []

                while (count < totalCount) {
                    const response = await queryFunction(query, variables)
                    _addresses = _addresses.concat(response?.data?.whoCollectedPublication?.items)
                    count += 25
                    cursor = "{\"offset\":" + count + "}"
                    variables.request.cursor = cursor
                }  

                allAddresses = _addresses  
            } else if (filter.reaction === 'Mirror') {
                const totalCount = (await queryFunction(query, variables))?.data?.profiles?.pageInfo?.totalCount
                let count = 0

                let _addresses: Array<any> = []

                while (count < totalCount) {
                    const response = await queryFunction(query, variables)
                    _addresses = _addresses.concat(response?.data?.profiles?.items)
                    count += 25
                    cursor = "{\"offset\":" + count + "}"
                    variables.request.cursor = cursor
                }  
                
                allAddresses = _addresses  
            } else if (filter.reaction === 'Comment') {
                const totalCount = (await queryFunction(query, variables))?.data?.publications?.pageInfo?.totalCount
                let count = 0

                let _addresses: Array<any> = []

                while (count < totalCount) {
                    const response = await queryFunction(query, variables)
                    _addresses = _addresses.concat(response?.data?.publications?.items)
                    count += 25
                    cursor = "{\"offset\":" + count + "}"
                    variables.request.cursor = cursor
                }  
                
                allAddresses = _addresses  
            }

            let preliminaryAddresses: Array<string> = []
            
            allAddresses?.map((item: any) => {
                if (filter.reaction === 'Collect') {
                    const address = item?.address
                    preliminaryAddresses?.push(address)
                } else if (filter.reaction === 'Mirror') {
                    const address: string = item?.ownedBy; 
                    preliminaryAddresses?.push(address); 
                } else if (filter.reaction === 'Comment') {
                    const address: string = item?.profile?.ownedBy; 
                    preliminaryAddresses?.push(address); 
                }
            }); 
            addresses = preliminaryAddresses
        }
        
        return addresses
    })

    const arrays = await Promise.all(executeFilter); 
    let qualifiedAddresses: Array<string> = []
    for (let i = 0; i < arrays.length; i++) {
        if (qualifiedAddresses.length === 0) {
            qualifiedAddresses = arrays[i]
        } else {
            qualifiedAddresses = qualifiedAddresses.filter((address) => arrays[i].includes(address))
        }
    }
    
    return qualifiedAddresses  
}

