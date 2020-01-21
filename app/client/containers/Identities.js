import React, {useState, useEffect, useContext} from 'react';
import {withRouter, Link, Redirect} from 'react-router-dom';
import {
    Button,
    Menu,
    Dropdown,
    Segment,
    Icon,
    Message
} from 'semantic-ui-react';

import {AuthContext} from '../context/auth';
import {useGet} from '../hooks';

import IdentitiesTable from '../components/IdentitiesTable/IdentitiesTable';


const Identities = ({match}) => {
    const type = match.path.slice(1);

    const tabs = {
        identities: 'identities'
    };

    const {user} = useContext(AuthContext);

    if (user.force_password_change) {
        return <Redirect to="/profile"/>;
    }

    const groups = user.user_info.groups;

    const activeTab = tabs[type];
    const [identities, fetch] = useGet(`/api/identities`);
    const [assets] = useGet(`/api/list`);

    useEffect(() => {
        if (identities.data || identities.error) {
            fetch();
        }
    }, [activeTab]);

    if (identities.loading) {
        return <>Loading...</>;
    }

    return (
        <>
            <Segment>
                <Menu text>
                    <Menu.Item
                        name="All Identities"
                        as={Link}
                        to="/identities"
                        active={type === 'identities'}
                    />
                </Menu>
                {identities.error ? (
                    <Message color="red">{identities.error}</Message>
                ) : (
                    <>
                        {!identities.data || !identities.data.length ? (
                            <>Identities not found</>
                        ) : (
                            <>
                                <IdentitiesTable
                                    type={type}
                                    identities={identities.data}
                                    assets={assets.data}
                                    userGroups={groups}
                                />
                            </>
                        )}
                    </>
                )}
            </Segment>
        </>
    );
};

export default withRouter(props => <Identities {...props} />);
