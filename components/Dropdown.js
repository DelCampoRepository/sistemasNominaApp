import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { Dropdown, MultiSelect } from 'react-native-element-dropdown';
import AntDesign from '@expo/vector-icons/AntDesign';
import menu from '../assets/menu.png';

const DropdownComponent = (props) => {
    const [isFocus, setIsFocus] = useState(false);

    const renderLabel = () => {
        return (
            <Text style={[styles.label, isFocus && { color: 'green' }, props.styleText]}>
                {props.label}
            </Text>
        );
    };

    const renderItem = (item) => {
        return (
            <View style={styles.item}>
                <Text style={styles.selectedTextStyle}>{item.label}</Text>
                <AntDesign style={styles.icon} color="black" name="Safety" size={20} />
            </View>
        );
    };

    const renderLeftIcon = () => (
        <Image
            source={menu}
            style={[styles.iconImage, props.stylesIcon]}
            resizeMode="contain"
        />
    );

    // --- NUEVA FUNCIÓN PARA EL ÍCONO DE BORRAR ---
    const renderRightIcon = () => {
        // Solo mostramos el ícono si hay un valor seleccionado y no es un multiselect
        if (props.selectedValue && !props.multiple) {
            return (
                <View style={styles.rightIconContainer}>
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={() => props.onChange(null)}
                    >
                        <AntDesign name="closecircleo" size={18} color="#999" />
                    </TouchableOpacity>
                </View>
            );
        }
        return null;
    };
    // ---------------------------------------------

    if (props.multiple) {
        return (
            <View style={styles.container}>
                {renderLabel()}
                <MultiSelect
                    style={[styles.dropdown, isFocus && { borderColor: 'blue' }, props.style]}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    inputSearchStyle={styles.inputSearchStyle}
                    iconStyle={styles.iconStyle}
                    data={props.options}
                    search={props.search}
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder={!isFocus ? props.placeholder || 'Seleccionar item' : '...'}
                    searchPlaceholder="Buscar..."
                    value={props.selectedValue}
                    dropdownPosition="top"
                    disable={props.disabled}
                    onFocus={() => setIsFocus(true)}
                    onBlur={() => setIsFocus(false)}
                    onChange={(item) => {
                        props.onChange(item);
                    }}
                    renderLeftIcon={renderLeftIcon}
                    renderItem={renderItem}
                    renderSelectedItem={(item, unSelect) => (
                        <TouchableOpacity onPress={() => unSelect && unSelect(item)}>
                            <View style={styles.selectedStyle}>
                                <Text style={styles.textSelectedStyle}>{item.label}</Text>
                                <AntDesign color="black" name="delete" size={12} />
                            </View>
                        </TouchableOpacity>
                    )}
                />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {renderLabel()}
            <Dropdown
                style={[styles.dropdown, isFocus && { borderColor: 'green' }, props.style]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={props.options}
                search={props.search}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={!isFocus ? props.placeholder || 'Seleccionar item' : '...'}
                searchPlaceholder="Buscar..."
                value={props.selectedValue}
                disable={props.disabled}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={(item) => {
                    props.onChange(item);
                    setIsFocus(false);
                }}
                renderLeftIcon={renderLeftIcon}
                renderRightIcon={() => {
                    if (props.selectedValue) {
                        return (
                            <View style={styles.rightIconContainer}>
                                <TouchableOpacity
                                    style={styles.clearButton}
                                    onPress={() => props.onChange(null)}
                                >
                                    <AntDesign name="closecircleo" size={18} color="#999" />
                                </TouchableOpacity>
                                <AntDesign name={isFocus ? 'caretup' : 'caretdown'} size={17} color="#666" />
                            </View>
                        );
                    }
                    return <AntDesign name={'caretdown'} size={17} color="#666" />;
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f0fff0',
        padding: 16,
        paddingHorizontal: 0,
        marginBottom: 0,
    },
    dropdown: {
        height: 50,
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
    },
    icon: {
        marginRight: 5,
    },
    iconImage: {
        width: 20,
        height: 20,
        marginRight: 10,
    },
    label: {
        fontSize: 15,
        fontWeight: 'bold',
        textAlign: 'center',
        color: 'black',
        position: 'absolute',
        backgroundColor: '#f0fff0',
        left: 5,
        top: -10,
        zIndex: 999,
        paddingHorizontal: 5,
    },
    placeholderStyle: {
        fontSize: 16,
        color: '#999',
    },
    selectedTextStyle: {
        fontSize: 16,
        color: '#000',
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
        color: '#000000',
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    // Nuevos estilos para el icono de la derecha
    rightIconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 6,
    },
    clearButton: {
        marginRight: 8,
    },
    item: {
        padding: 17,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selectedStyle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: '#d0e0d0',
        borderRadius: 8,
        marginTop: 5,
        marginRight: 5,
    },
    textSelectedStyle: {
        marginRight: 10,
        fontSize: 14,
        color: '#000000',
    },
});

export default DropdownComponent;