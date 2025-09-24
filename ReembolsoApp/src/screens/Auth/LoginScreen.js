import React, { useState, useContext, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, Alert, TouchableOpacity, Switch, Image, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../constants/apiConfig';
import { storeToken, storeLastUser, getLastUser, removeLastUser } from '../../storage/authStorage';
import AnimatedBackground from '../../components/AnimatedBackground';

const CustomButton = ({ title, onPress }) => (
  <TouchableOpacity style={styles.button} onPress={onPress}>
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

const { height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const { signIn } = useContext(AuthContext);

    const loginBoxTranslateY = useSharedValue(height);

    useEffect(() => {
        const loadAndAnimate = async () => {
            const lastEmail = await getLastUser();
            if (lastEmail) {
                setEmail(lastEmail);
                setRememberMe(true);
            }
            loginBoxTranslateY.value = withTiming(0, {
                duration: 800,
                easing: Easing.out(Easing.ease),
            });
        };
        loadAndAnimate();
    }, []);

    const animatedLoginBoxStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: loginBoxTranslateY.value }],
        };
    });

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Erro", "Por favor, preencha e-mail e senha.");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Erro ao fazer login");
            }
            
            await storeToken(data.token);

            if (rememberMe) {
                await storeLastUser(email);
            } else {
                await removeLastUser();
            }

            signIn(data.token);

        } catch (error) {
            Alert.alert("Erro de Login", error.message);
        }
    };

    return (
        <AnimatedBackground>
            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../../assets/images/logo.png')}
                        style={styles.smallLogo}
                        resizeMode="contain"
                    />
                </View>
                
                <Animated.View style={[styles.loginBox, animatedLoginBoxStyle]}>
                    <Text style={styles.boxTitle}>Bem-vindo!</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="E-mail"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholderTextColor="#666"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Senha"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        placeholderTextColor="#666"
                    />

                    <View style={styles.rememberMeContainer}>
                        <Switch
                            trackColor={{ false: "#767577", true: "#81b0ff" }}
                            thumbColor={rememberMe ? "#0056b3" : "#f4f3f4"}
                            onValueChange={setRememberMe}
                            value={rememberMe}
                        />
                        <Text style={styles.rememberMeText}>Lembrar de mim</Text>
                    </View>

                    <CustomButton title="Entrar" onPress={handleLogin} />

                    <View style={styles.linksContainer}>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.linkText}>Não tem uma conta? Cadastre-se</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                            <Text style={styles.linkText}>Esqueceu a senha?</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </KeyboardAvoidingView>
        </AnimatedBackground>
    );
};

const styles = StyleSheet.create({
    keyboardAvoidingView: {
        flex: 1,
        width: '100%',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    logoContainer: {
        position: 'absolute',
        top: height * 0.1,
        alignItems: 'center',
        width: '100%',
    },
    smallLogo: {
        width: 300, 
        height: 300, 
        marginBottom: 20,
    },
    loginBox: {
        width: '90%',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 15,
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
        marginBottom: height * 0.05,
    },
    boxTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0056b3',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        marginBottom: 15,
        fontSize: 16,
        color: '#333',
    },
    rememberMeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginBottom: 20,
    },
    rememberMeText: {
        marginLeft: 10,
        fontSize: 16,
        color: '#555',
    },
    button: {
        width: '100%',
        backgroundColor: '#0056b3',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    linksContainer: {
        marginTop: 15,
        alignItems: 'center',
    },
    linkText: {
        color: '#0056b3',
        marginVertical: 8,
        fontSize: 15,
    },
});

export default LoginScreen;