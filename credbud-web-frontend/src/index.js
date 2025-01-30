import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import 'assets/css/App.css';
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom';
import AuthLayout from 'layouts/auth';
import AdminLayout from 'layouts/admin';
import ModeratorLayout from 'layouts/moderator';
import RtlLayout from 'layouts/rtl';
import { ChakraProvider } from '@chakra-ui/react';
import theme from 'theme/theme';
import { ThemeEditorProvider } from '@hypertheme-editor/chakra-ui';
import RegistrationPage from 'views/reg/register';
import TokenDisplay from 'views/reg/token';
import { UserAuthContextProvider } from 'contexts/UserAuthContext';
import ProtectedRoute from 'components/ProtectedRoute'
import { cleanupLocalStorage } from 'utils/cleanupLocalStorage';
ReactDOM.render(
	
	<ChakraProvider theme={theme}>
		{/* <React.StrictMode> */}
				<UserAuthContextProvider>
			<ThemeEditorProvider>
				<HashRouter>
					<Switch>
						<Route path={`/auth`} component={AuthLayout} />
						
						<Route path={`/moderator`}>
							<ProtectedRoute><ModeratorLayout/></ProtectedRoute>
							</Route>
						<Route path={`/admin`}>
							<ProtectedRoute><AdminLayout/></ProtectedRoute>
							</Route>
						<Route path={`/rtl`} component={RtlLayout} />
						<Route path={`/register`} component={RegistrationPage} />
						{/* <Route path={`/token`} component={<ProtectedRoute></ProtectedRoute>} /> */}
						<Route path={`/token`}>
							<ProtectedRoute><TokenDisplay/></ProtectedRoute>
							</Route>
						<Redirect from='/' to='/auth' />
					</Switch>
				</HashRouter>
			</ThemeEditorProvider>
				</UserAuthContextProvider>
		{/* </React.StrictMode> */}
	</ChakraProvider>,
	document.getElementById('root')
);
