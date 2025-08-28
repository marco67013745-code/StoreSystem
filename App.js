import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  Platform, 
  ActivityIndicator, 
  StatusBar, 
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  Modal as RNModal
} from 'react-native';
import { Appbar, Searchbar, List, FAB, TextInput, Button, RadioButton, Text, Dialog, Provider as PaperProvider, Menu, IconButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const App = () => {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStock, setFilterStock] = useState('all');
  const [visible, setVisible] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [language, setLanguage] = useState('en');
  const [isLanguageDialogVisible, setIsLanguageDialogVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // New state variables for multi-select functionality
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());
  
  // Separate state variables for each menu
  const [filterTypeMenuVisible, setFilterTypeMenuVisible] = useState(false);
  const [filterStockMenuVisible, setFilterStockMenuVisible] = useState(false);
  const [itemTypeMenuVisible, setItemTypeMenuVisible] = useState(false);

  // Form states
  const [itemId, setItemId] = useState('');
  const [itemName, setItemName] = useState('');
  const [numberOfItems, setNumberOfItems] = useState('');
  const [itemType, setItemType] = useState('FA & HN');
  const [isPackage, setIsPackage] = useState('no');
  const [numberOfPackages, setNumberOfPackages] = useState('');
  const [itemsPerPackage, setItemsPerPackage] = useState('');

  // Keyboard state
  const [isKeyboardActive, setIsKeyboardActive] = useState(false);

  // Use ref to track the latest items state
  const itemsRef = useRef(items);
  const scrollViewRef = useRef(null);

  // Keyboard handlers
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardActive(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardActive(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // New state variables for modify flow
  const [modifyStep, setModifyStep] = useState('action');
  const [modifyAction, setModifyAction] = useState('increase');
  const [foundItem, setFoundItem] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Translations
  const translations = {
    en: {
      title: 'Store System',
      search: 'Search items...',
      add: 'Add',
      modify: 'Modify',
      language: 'Language',
      filter: 'Type',
      all: 'All',
      itemId: 'ID',
      itemName: 'Item Name',
      numberOfItems: 'Number of Items',
      itemType: 'Type',
      submit: 'Submit',
      cancel: 'Cancel',
      package: 'Is it a package?',
      yes: 'Yes',
      no: 'No',
      numberOfPackages: 'Number of Packages',
      itemsPerPackage: 'Items per Package',
      totalItems: 'Total Items',
      addItem: 'Add Item',
      modifyItem: 'Modify Item',
      selectLanguage: 'Select Language',
      english: 'English',
      traditionalChinese: '繁体中文',
      simplifiedChinese: '简体中文',
      save: 'Save',
      validation: 'Please fill all required fields',
      operationSuccess: 'Operation completed successfully',
      generatedId: 'Generated ID',
      selectType: 'Select Type',
      export: 'Export Data',
      import: 'Import Data',
      loading: 'Loading...',
      refresh: 'Refresh',
      selectMode: 'Select Mode',
      exitSelectMode: 'Exit Select Mode',
      deleteSelected: 'Delete Selected',
      confirmDelete: 'Are you sure you want to delete the selected items?',
      itemsSelected: 'items selected',
      noItemsSelected: 'No items selected',
      showKeyboard: 'Show Keyboard',
      hideKeyboard: 'Hide Keyboard',
      searchItem: 'Enter Item ID or Name',
      searchButton: 'Search',
      action: 'Action',
      increase: 'Add',
      decrease: 'Take',
      amount: 'Amount',
      next: 'Next',
      previous: 'Previous',
      itemNotFound: 'Item not found',
      currentDetails: 'Current Item Details',
      invalidAmount: 'Invalid amount. Please fill all required fields.',
      insufficientItems: 'Insufficient items to take',
      stockFilter: 'Stock Status',
      inStock: 'In Stock',
      outOfStock: 'Out of Stock'
    },
    'zh-HK': {
      title: '物資系統',
      search: '搜索物資...',
      add: '添加',
      modify: '修改',
      language: '語言',
      filter: '按類型篩選',
      all: '全部',
      itemId: 'ID',
      itemName: '物資名稱',
      numberOfItems: '物資數量',
      itemType: '類型',
      submit: '提交',
      cancel: '取消',
      package: '是否是包裝？',
      yes: '是',
      no: '否',
      numberOfPackages: '包裝數量',
      itemsPerPackage: '每個包裝的物資數量',
      totalItems: '總物資數量',
      addItem: '添加物資',
      modifyItem: '修改物資',
      selectLanguage: '選擇語言',
      english: 'English',
      traditionalChinese: '繁体中文',
      simplifiedChinese: '简体中文',
      save: '保存',
      validation: '請填寫所有必填',
      operationSuccess: '操作成功完成',
      generatedId: '生成的ID',
      selectType: '選擇類型',
      export: '導出數據',
      import: '導入數據',
      loading: '加載中...',
      refresh: '刷新',
      selectMode: '選擇模式',
      exitSelectMode: '退出選擇模式',
      deleteSelected: '刪除選中項目',
      confirmDelete: '確定要刪除選中的項目嗎？',
      itemsSelected: '個項目已選中',
      noItemsSelected: '未選中任何項目',
      showKeyboard: '顯示鍵盤',
      hideKeyboard: '隱藏鍵盤',
      searchItem: '輸入物資 ID 或名稱',
      searchButton: '搜索',
      action: '操作',
      increase: '添加',
      decrease: '取出',
      amount: '數量',
      next: '下一步',
      previous: '上一步',
      itemNotFound: '找不到物資',
      currentDetails: '當前物資詳情',
      invalidAmount: '無效的數量。',
      insufficientItems: '物資數量不足以取出',
      stockFilter: '庫存篩選',
      inStock: '有庫存',
      outOfStock: '缺貨'
    },
    'zh-CN': {
      title: '物资系统',
      search: '搜索物资...',
      add: '添加',
      modify: '修改',
      language: '语言',
      filter: '按类型筛选',
      all: '全部',
      itemId: 'ID',
      itemName: '物资名称',
      numberOfItems: '物资数量',
      itemType: '类型',
      submit: '提交',
      cancel: '取消',
      package: '是否是包裹？',
      yes: '是',
      no: '否',
      numberOfPackages: '包装数量',
      itemsPerPackage: '每个包装的物资数量',
      totalItems: '总物资数量',
      addItem: '添加物资',
      modifyItem: '修改物资',
      selectLanguage: '选择语言',
      english: 'English',
      traditionalChinese: '繁体中文',
      simplifiedChinese: '简体中文',
      save: '保存',
      validation: '请填写所有必填',
      operationSuccess: '操作成功完成',
      generatedId: '生成的ID',
      selectType: '选择类型',
      export: '导出数据',
      import: '导入数据',
      loading: '加载中...',
      refresh: '刷新',
      selectMode: '选择模式',
      exitSelectMode: '退出选择模式',
      deleteSelected: '删除选中项目',
      confirmDelete: '确定要删除选中的项目吗？',
      itemsSelected: '个项目已选中',
      noItemsSelected: '未选中任何项目',
      showKeyboard: '显示键盘',
      hideKeyboard: '隐藏键盘',
      searchItem: '输入物品 ID 或名称',
      searchButton: '搜索',
      action: '操作',
      increase: '添加',
      decrease: '取出',
      amount: '数量',
      next: '下一步',
      previous: '上一步',
      itemNotFound: '找不到物资',
      currentDetails: '当前物资详情',
      invalidAmount: '无效的数量。请填写所有必填字段。',
      insufficientItems: '物资数量不足以取出',
      stockFilter: '库存筛选',
      inStock: '有库存',
      outOfStock: '缺货'
    }
  };

  const t = translations[language];

  // Load language preference and items on app start
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [savedLanguage, savedItems] = await Promise.all([
          AsyncStorage.getItem('language'),
          AsyncStorage.getItem('items')
        ]);
        
        if (savedLanguage && ['en', 'zh-HK', 'zh-CN'].includes(savedLanguage)) {
          setLanguage(savedLanguage);
        } else if (savedLanguage) {
          // Invalid language; reset to default
          await AsyncStorage.setItem('language', 'en');
          setLanguage('en');
        }
        
        if (savedItems) {
          try {
            const parsedItems = JSON.parse(savedItems);
            if (Array.isArray(parsedItems)) {
              setItems(parsedItems);
              itemsRef.current = parsedItems;
            }
          } catch (parseError) {
            console.error('Error parsing saved items:', parseError);
            setItems([]);
            itemsRef.current = [];
            await AsyncStorage.setItem('items', JSON.stringify([]));
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        Alert.alert('Error', 'Failed to load saved data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Update the ref whenever items change
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Save items to AsyncStorage whenever they change
  useEffect(() => {
    const saveItems = async () => {
      if (items.length === 0 && !isLoading) {
        try {
          await AsyncStorage.setItem('items', JSON.stringify(items));
          console.log('Empty items array saved');
        } catch (error) {
          console.error('Error saving empty items:', error);
        }
        return;
      }
      
      if (items.length === 0) return;
      
      try {
        await AsyncStorage.setItem('items', JSON.stringify(items));
        console.log('Items saved successfully');
      } catch (error) {
        console.error('Error saving items:', error);
        setTimeout(async () => {
          try {
            await AsyncStorage.setItem('items', JSON.stringify(items));
          } catch (retryError) {
            console.error('Retry save failed:', retryError);
          }
        }, 1000);
      }
    };
    
    saveItems();
  }, [items]);

  // Create periodic backups
  useEffect(() => {
    const backupInterval = setInterval(async () => {
      try {
        const currentItems = await AsyncStorage.getItem('items');
        if (currentItems) {
          await AsyncStorage.setItem('items_backup', currentItems);
          console.log('Backup created successfully');
        }
      } catch (error) {
        console.error('Backup failed:', error);
      }
    }, 300000);

    return () => clearInterval(backupInterval);
  }, []);

  // Manual refresh function
  const refreshData = async () => {
    try {
      setIsLoading(true);
      const savedItems = await AsyncStorage.getItem('items');
      if (savedItems) {
        const parsedItems = JSON.parse(savedItems);
        if (Array.isArray(parsedItems)) {
          setItems(parsedItems);
          itemsRef.current = parsedItems;
          console.log('Data refreshed successfully');
        }
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  };

  // Manual save function
  const manuallySaveItems = async (itemsToSave) => {
    try {
      await AsyncStorage.setItem('items', JSON.stringify(itemsToSave));
      console.log('Manual save successful');
    } catch (error) {
      console.error('Manual save failed:', error);
      setTimeout(() => {
        AsyncStorage.setItem('items', JSON.stringify(itemsToSave));
      }, 1000);
    }
  };

  // Filter and search items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.itemId?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || item.itemType === filterType;
    const matchesStock = filterStock === 'all' ||
                         (filterStock === 'in' && item.numberOfItems > 0) ||
                         (filterStock === 'out' && item.numberOfItems <= 0);
    return matchesSearch && matchesFilter && matchesStock;
  });

  // Generate a unique integer ID for new items starting from 0001
  const generateId = () => {
    if (items.length === 0) return '0001';
    
    const numericIds = items.map(item => {
      const id = parseInt(item.itemId, 10);
      return isNaN(id) ? 0 : id;
    });
    
    const maxId = Math.max(...numericIds, 0);
    const newId = maxId + 1;
    
    return newId.toString().padStart(4, '0');
  };

  // Reset form
  const resetForm = () => {
    setItemId('');
    setItemName('');
    setNumberOfItems('');
    setItemType('FA & HN');
    setIsPackage('no');
    setNumberOfPackages('');
    setItemsPerPackage('');
    setSelectedItem(null);
    setModifyStep('action');
    setModifyAction('increase');
    setFoundItem(null);
    setErrorMessage('');
  };

  // Handle modal open for add
  const openAddModal = () => {
    resetForm();
    const newId = generateId();
    setItemId(newId);
    setModalType('add');
    setVisible(true);
  };

  // Handle modal open for modify from list item
  const openModifyModal = (item) => {
    resetForm();
    setModalType('modify');
    setFoundItem(item);
    setItemType(item.itemType);
    setModifyStep('action');
    setVisible(true);
  };

  // Handle next from amount step
  const handleAmountNext = () => {
    let delta;
    if (isPackage === 'yes') {
      const pkgs = parseInt(numberOfPackages || '0');
      const perPkg = parseInt(itemsPerPackage || '0');
      if (isNaN(pkgs) || isNaN(perPkg) || pkgs <= 0 || perPkg <= 0) {
        Alert.alert('Error', t.invalidAmount);
        return;
      }
      delta = pkgs * perPkg;
    } else {
      delta = parseInt(numberOfItems || '0');
      if (isNaN(delta) || delta <= 0) {
        Alert.alert('Error', t.invalidAmount);
        return;
      }
    }
    setModifyStep('type');
  };

  // Handle modify submit
  const handleModifySubmit = () => {
    let delta;
    if (isPackage === 'yes') {
      delta = parseInt(numberOfPackages || '0') * parseInt(itemsPerPackage || '0');
    } else {
      delta = parseInt(numberOfItems || '0');
    }

    let newTotal = foundItem.numberOfItems + (modifyAction === 'increase' ? delta : -delta);
    if (newTotal < 0) {
      Alert.alert('Error', t.insufficientItems);
      return;
    }

    const updatedItem = {
      ...foundItem,
      numberOfItems: newTotal,
      itemType: itemType,
    };

    setItems(prevItems => 
      prevItems.map(item => 
        item.itemId === foundItem.itemId ? updatedItem : item
      )
    );
    Alert.alert('Success', t.operationSuccess);
    setVisible(false);
    resetForm();
  };

  // Handle add submit
  const handleAddSubmit = () => {
    if (!itemName) {
      Alert.alert('Error', t.validation);
      return;
    }

    let totalItems = parseInt(numberOfItems) || 0;
    
    if (isPackage === 'yes') {
      if (!numberOfPackages || !itemsPerPackage) {
        Alert.alert('Error', t.validation);
        return;
      }
      totalItems = parseInt(numberOfPackages) * parseInt(itemsPerPackage);
    }

    const itemData = {
      itemId,
      itemName,
      numberOfItems: totalItems,
      itemType,
      isPackage,
      ...(isPackage === 'yes' && {
        numberOfPackages: parseInt(numberOfPackages),
        itemsPerPackage: parseInt(itemsPerPackage)
      })
    };

    const updatedItems = [...items, itemData];
    setItems(updatedItems);
    Alert.alert('Success', t.operationSuccess);
    setVisible(false);
    resetForm();
  };

  // Handle language change
  const handleLanguageChange = async (newLanguage) => {
    if (['en', 'zh-HK', 'zh-CN'].includes(newLanguage)) {
      setLanguage(newLanguage);
      setIsLanguageDialogVisible(false);
      try {
        await AsyncStorage.setItem('language', newLanguage);
      } catch (error) {
        console.error('Error saving language:', error);
      }
    } else {
      Alert.alert('Error', 'Invalid language selected');
    }
  };

  // Export data function
  const exportData = async () => {
    try {
      const data = await AsyncStorage.getItem('items');
      if (!data || JSON.parse(data).length === 0) {
        Alert.alert('Info', 'No data to export');
        return;
      }

      const jsonData = JSON.stringify({
        items: JSON.parse(data),
        exportedAt: new Date().toISOString(),
        version: '1.0',
        app: 'Store System'
      });

      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `store-system-backup-${timestamp}.json`;
      
      const fileUri = FileSystem.documentDirectory + fileName;
      await FileSystem.writeAsStringAsync(fileUri, jsonData);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Export Store Data',
          UTI: 'public.json'
        });
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'Failed to export data: ' + error.message);
    }
  };

  const importData = async () => {
    try {
      setIsLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });
      
      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        let fileContent;
        
        fileContent = await FileSystem.readAsStringAsync(asset.uri);
        
        let parsedData;
        try {
          parsedData = JSON.parse(fileContent);
        } catch (parseError) {
          console.error('Parse error:', parseError);
          Alert.alert('Error', 'Invalid JSON file format');
          setIsLoading(false);
          return;
        }
        
        let itemsToImport = [];
        
        if (parsedData.items && Array.isArray(parsedData.items)) {
          itemsToImport = parsedData.items;
        } else if (Array.isArray(parsedData)) {
          itemsToImport = parsedData;
        } else {
          Alert.alert('Error', 'Invalid data format in the selected file');
          setIsLoading(false);
          return;
        }
        
        const validItems = itemsToImport.filter(item => 
          item.itemId && item.itemName && item.numberOfItems !== undefined
        );
        
        if (validItems.length !== itemsToImport.length) {
          Alert.alert(
            'Warning', 
            `Only ${validItems.length} out of ${itemsToImport.length} items were valid and imported.`,
            [{ text: 'OK' }]
          );
        }
        
        if (validItems.length > 0) {
          setItems(validItems);
          itemsRef.current = validItems;
          await AsyncStorage.setItem('items', JSON.stringify(validItems));
          Alert.alert('Success', `${validItems.length} items imported successfully`);
        } else {
          Alert.alert('Error', 'No valid items found in the file');
        }
      } else if (result.canceled) {
        console.log('Import canceled by user');
      }
    } catch (error) {
      console.error('Error importing data:', error);
      Alert.alert('Error', `Failed to import data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // New functions for multi-select functionality
  const handleLongPressItem = (itemId) => {
    if (!isSelectMode) {
      setIsSelectMode(true);
    }
    toggleItemSelection(itemId);
  };

  const toggleItemSelection = (itemId) => {
    const newSelectedItems = new Set(selectedItems);
    if (newSelectedItems.has(itemId)) {
      newSelectedItems.delete(itemId);
    } else {
      newSelectedItems.add(itemId);
    }
    setSelectedItems(newSelectedItems);
    
    if (newSelectedItems.size === 0) {
      setIsSelectMode(false);
    }
  };

  const exitSelectMode = () => {
    setIsSelectMode(false);
    setSelectedItems(new Set());
  };

  const deleteSelectedItems = () => {
    if (selectedItems.size === 0) {
      Alert.alert('Info', t.noItemsSelected);
      return;
    }

    Alert.alert(
      t.deleteSelected,
      t.confirmDelete,
      [
        {
          text: t.cancel,
          style: 'cancel',
        },
        {
          text: t.deleteSelected,
          style: 'destructive',
          onPress: () => {
            const updatedItems = itemsRef.current.filter(item => !selectedItems.has(item.itemId));
            setItems(updatedItems);
            manuallySaveItems(updatedItems);
            exitSelectMode();
            setTimeout(() => {
              Alert.alert('Success', `${selectedItems.size} items deleted successfully`);
            }, 100);
          },
        },
      ]
    );
  };

  const handleSelectAll = () => {
    const allSelected = selectedItems.size === filteredItems.length && filteredItems.length > 0;
    const newSelectedItems = allSelected ? new Set() : new Set(filteredItems.map(item => item.itemId));
    setSelectedItems(newSelectedItems);
    
    if (newSelectedItems.size === 0) {
      setIsSelectMode(false);
    }
  };

  // Function to dismiss keyboard
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Function to toggle keyboard
  const toggleKeyboard = () => {
    if (isKeyboardActive) {
      dismissKeyboard();
    }
  };

  // Item types for dropdown
  const itemTypes = ['FA & HN', 'UI', 'Training', 'Game', 'Others'];

  const allSelected = isSelectMode && filteredItems.length > 0 && selectedItems.size === filteredItems.length;

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <SafeAreaView style={styles.container}>
          <TouchableWithoutFeedback onPress={dismissKeyboard} accessible={false}>
            <View style={{ flex: 1 }}>
              <StatusBar backgroundColor="#6200ee" barStyle="light-content" />
              <Appbar.Header style={styles.appBar}>
                {isSelectMode ? (
                  <>
                    <Appbar.Action 
                      icon="close" 
                      onPress={exitSelectMode} 
                      color="#fff" 
                    />
                    <Appbar.Action 
                      icon={allSelected ? "checkbox-multiple-marked" : "checkbox-multiple-blank-outline"}
                      onPress={handleSelectAll}
                      color="#fff" 
                    />
                    <Appbar.Content 
                      title={`${selectedItems.size} ${t.itemsSelected}`} 
                      titleStyle={styles.whiteText} 
                    />
                    <Appbar.Action 
                      icon="delete" 
                      onPress={deleteSelectedItems} 
                      color="#fff" 
                    />
                  </>
                ) : (
                  <>
                    <Appbar.Content title={t.title} titleStyle={styles.whiteText} />
                    <Appbar.Action icon="refresh" onPress={refreshData} color="#fff" />
                    <Appbar.Action icon="export" onPress={exportData} color="#fff" />
                    <Appbar.Action icon="import" onPress={importData} color="#fff" />
                    <Appbar.Action icon="translate" onPress={() => setIsLanguageDialogVisible(true)} color="#fff" />
                  </>
                )}
              </Appbar.Header>

              {!isSelectMode && (
                <>
                  <View style={styles.searchContainer}>
                    <Searchbar
                      placeholder={t.search}
                      onChangeText={setSearchQuery}
                      value={searchQuery}
                      style={styles.searchbar}
                      placeholderTextColor="#666"
                      iconColor="#666"
                      inputStyle={styles.blackText}
                    />
                  </View>

                  <View style={styles.filtersRow}>
                    <View style={[styles.typeFilterContainer, { flex: 1, marginRight: 8 }]}>
                      <Text style={[styles.label, styles.blackText]}>{t.filter}</Text>
                      <Menu
                        visible={filterTypeMenuVisible}
                        onDismiss={() => setFilterTypeMenuVisible(false)}
                        anchor={
                          <Button 
                            onPress={() => setFilterTypeMenuVisible(true)}
                            mode="outlined"
                            style={styles.typeButton}
                            contentStyle={styles.typeButtonContent}
                          >
                            <Text style={[styles.blackText, styles.centeredText]}>{filterType === 'all' ? t.all : filterType}</Text>
                          </Button>
                        }
                        contentStyle={styles.menuContent}
                      >
                        <Menu.Item
                          onPress={() => {
                            setFilterType('all');
                            setFilterTypeMenuVisible(false);
                          }}
                          title={t.all}
                          titleStyle={styles.blackText}
                        />
                        {itemTypes.map(type => (
                          <Menu.Item
                            key={type}
                            onPress={() => {
                              setFilterType(type);
                              setFilterTypeMenuVisible(false);
                            }}
                            title={type}
                            titleStyle={styles.blackText}
                          />
                        ))}
                      </Menu>
                    </View>
                    
                    <View style={[styles.typeFilterContainer, { flex: 1, marginLeft: 5 }]}>
                      <Text style={[styles.label, styles.blackText]}>{t.stockFilter}</Text>
                      <Menu
                        visible={filterStockMenuVisible}
                        onDismiss={() => setFilterStockMenuVisible(false)}
                        anchor={
                          <Button 
                            onPress={() => setFilterStockMenuVisible(true)}
                            mode="outlined"
                            style={styles.typeButton}
                            contentStyle={styles.typeButtonContent}
                          >
                            <Text style={[styles.blackText, styles.centeredText]}>
                              {filterStock === 'all' ? t.all : filterStock === 'in' ? t.inStock : t.outOfStock}
                            </Text>
                          </Button>
                        }
                        contentStyle={styles.menuContent}
                      >
                        <Menu.Item
                          onPress={() => {
                            setFilterStock('all');
                            setFilterStockMenuVisible(false);
                          }}
                          title={t.all}
                          titleStyle={styles.blackText}
                        />
                        <Menu.Item
                          onPress={() => {
                            setFilterStock('in');
                            setFilterStockMenuVisible(false);
                          }}
                          title={t.inStock}
                          titleStyle={styles.blackText}
                        />
                        <Menu.Item
                          onPress={() => {
                            setFilterStock('out');
                            setFilterStockMenuVisible(false);
                          }}
                          title={t.outOfStock}
                          titleStyle={styles.blackText}
                        />
                      </Menu>
                    </View>
                  </View>
                </>
              )}

              {isLoading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#6200ee" />
                  <Text style={styles.loadingText}>{t.loading}</Text>
                </View>
              )}

              <ScrollView 
                style={styles.listContainer}
                keyboardShouldPersistTaps="handled"
              >
                {filteredItems.map(item => (
                  <List.Item
                    key={item.itemId}
                    title={<Text style={styles.itemName}>{item.itemName}</Text>}
                    description={() => (
                      <View style={styles.itemDetails}>
                        <Text style={styles.itemDetail}>{`${t.itemId}: ${item.itemId}`}</Text>
                        <Text style={styles.itemDetail}>{`${t.numberOfItems}: ${Math.floor(item.numberOfItems)}`}</Text>
                        <Text style={styles.itemDetail}>{`${t.itemType}: ${item.itemType}`}</Text>
                      </View>
                    )}
                    right={props => (
                      <View style={styles.modifyButtonContainer}>
                        {isSelectMode ? (
                          <IconButton
                            icon={selectedItems.has(item.itemId) ? "checkbox-marked" : "checkbox-blank-outline"}
                            iconColor={selectedItems.has(item.itemId) ? "#6200ee" : "#666"}
                            size={24}
                            onPress={() => toggleItemSelection(item.itemId)}
                          />
                        ) : (
                          <Button 
                            onPress={() => openModifyModal(item)}
                            mode="contained"
                            style={styles.modifyButton}
                            labelStyle={styles.modifyButtonLabel}
                            compact={true}
                          >
                            {t.modify}
                          </Button>
                        )}
                      </View>
                    )}
                    style={[
                      styles.listItem,
                      isSelectMode && selectedItems.has(item.itemId) && styles.selectedItem
                    ]}
                    onPress={() => {
                      if (isSelectMode) {
                        toggleItemSelection(item.itemId);
                      }
                    }}
                    onLongPress={() => handleLongPressItem(item.itemId)}
                  />
                ))}
              </ScrollView>

              {!isSelectMode && (
                <FAB
                  style={styles.fab}
                  icon="plus"
                  onPress={openAddModal}
                  label={t.add}
                  color="#fff"
                />
              )}

              {/* Add/Modify Item Modal */}
              <RNModal
                visible={visible}
                onRequestClose={() => {
                  setVisible(false);
                  dismissKeyboard();
                }}
                animationType="fade"
                transparent={false}
              >
                <PaperProvider>
                  <View style={styles.fullScreenModal}>
                    <KeyboardAvoidingView 
                      behavior={Platform.OS === "ios" ? "padding" : "height"}
                      style={styles.keyboardAvoid}
                    >
                      <View style={styles.fullScreenView}>
                        <View style={styles.modalHeader}>
                          <Text style={[styles.modalTitle, styles.whiteText]}>
                            {modalType === 'add' ? t.addItem : t.modifyItem}
                          </Text>
                          <IconButton 
                            icon={isKeyboardActive ? "keyboard-off" : "keyboard"} 
                            onPress={toggleKeyboard} 
                            iconColor="#fff" 
                          />
                        </View>
                        <View style={styles.modalContentContainer}>
                          <ScrollView 
                            ref={scrollViewRef}
                            onContentSizeChange={() => {
                              if (isKeyboardActive && scrollViewRef.current) {
                                scrollViewRef.current.scrollToEnd({ animated: true });
                              }
                            }}
                            contentContainerStyle={styles.scrollContent}
                          >
                            <View style={styles.content}>
                              {modalType === 'add' ? (
                                <>
                                  <Text style={[styles.generatedId, styles.whiteText]}>
                                    {t.generatedId}: {itemId}
                                  </Text>
                                  
                                  <TextInput
                                    label={t.itemName}
                                    value={itemName}
                                    onChangeText={setItemName}
                                    style={styles.input}
                                    theme={{ colors: { primary: '#bb86fc', text: '#fff', placeholder: '#aaa', background: 'transparent' } }}
                                    mode="outlined"
                                    onSubmitEditing={dismissKeyboard}
                                    returnKeyType="done"
                                  />
                                  
                                  <Text style={[styles.label, styles.whiteText]}>{t.package}</Text>
                                  <View style={styles.radioContainer}>
                                    <RadioButton.Item 
                                      label={t.yes} 
                                      value="yes" 
                                      color="#bb86fc"
                                      uncheckedColor="#fff"
                                      labelStyle={styles.whiteText}
                                      status={isPackage === 'yes' ? 'checked' : 'unchecked'}
                                      onPress={() => setIsPackage('yes')}
                                    />
                                    <RadioButton.Item 
                                      label={t.no} 
                                      value="no" 
                                      color="#bb86fc"
                                      uncheckedColor="#fff"
                                      labelStyle={styles.whiteText}
                                      status={isPackage === 'no' ? 'checked' : 'unchecked'}
                                      onPress={() => setIsPackage('no')}
                                    />
                                  </View>
                                  
                                  {isPackage === 'yes' ? (
                                    <>
                                      <TextInput
                                        label={t.numberOfPackages}
                                        value={numberOfPackages}
                                        onChangeText={setNumberOfPackages}
                                        keyboardType="numeric"
                                        style={styles.input}
                                        theme={{ colors: { primary: '#bb86fc', text: '#fff', placeholder: '#aaa', background: 'transparent' } }}
                                        mode="outlined"
                                        onSubmitEditing={dismissKeyboard}
                                        returnKeyType="done"
                                      />
                                      <TextInput
                                        label={t.itemsPerPackage}
                                        value={itemsPerPackage}
                                        onChangeText={setItemsPerPackage}
                                        keyboardType="numeric"
                                        style={styles.input}
                                        theme={{ colors: { primary: '#bb86fc', text: '#fff', placeholder: '#aaa', background: 'transparent' } }}
                                        mode="outlined"
                                        onSubmitEditing={dismissKeyboard}
                                        returnKeyType="done"
                                      />
                                      <Text style={[styles.totalText, styles.whiteText]}>
                                        {t.totalItems}: {numberOfPackages && itemsPerPackage 
                                          ? Math.floor(parseInt(numberOfPackages) * parseInt(itemsPerPackage))
                                          : 0}
                                      </Text>
                                    </>
                                  ) : (
                                    <TextInput
                                      label={t.numberOfItems}
                                      value={numberOfItems}
                                      onChangeText={setNumberOfItems}
                                      keyboardType="numeric"
                                      style={styles.input}
                                      theme={{ colors: { primary: '#bb86fc', text: '#fff', placeholder: '#aaa', background: 'transparent' } }}
                                      mode="outlined"
                                      onSubmitEditing={dismissKeyboard}
                                      returnKeyType="done"
                                    />
                                  )}
                                  
                                  <Text style={[styles.label, styles.whiteText]}>{t.itemType}</Text>
                                  
                                  <Menu
                                    visible={itemTypeMenuVisible}
                                    onDismiss={() => setItemTypeMenuVisible(false)}
                                    anchor={
                                      <Button 
                                        onPress={() => setItemTypeMenuVisible(true)}
                                        mode="outlined"
                                        style={styles.typeButtonModal}
                                        contentStyle={styles.typeButtonContent}
                                        textColor="#fff"
                                      >
                                        <Text style={[styles.whiteText, styles.centeredText]}>{itemType}</Text>
                                      </Button>
                                    }
                                    contentStyle={styles.menuContentModal}
                                  >
                                    {itemTypes.map(type => (
                                      <Menu.Item
                                        key={type}
                                        onPress={() => {
                                          setItemType(type);
                                          setItemTypeMenuVisible(false);
                                        }}
                                        title={type}
                                        titleStyle={styles.whiteText}
                                      />
                                    ))}
                                  </Menu>
                                </>
                              ) : (
                                <>
                                  {foundItem && (
                                    <Text style={[styles.currentDetails, styles.whiteText]}>
                                      {t.currentDetails}:
                                      {'\n'}{t.itemId}: {foundItem.itemId}
                                      {'\n'}{t.itemName}: {foundItem.itemName}
                                      {'\n'}{t.numberOfItems}: {foundItem.numberOfItems}
                                      {'\n'}{t.itemType}: {foundItem.itemType}
                                    </Text>
                                  )}
                                  {modifyStep === 'action' ? (
                                    <>
                                      <Text style={[styles.label, styles.whiteText]}>{t.action}</Text>
                                      <View style={styles.radioContainer}>
                                        <RadioButton.Item 
                                          label={t.increase} 
                                          value="increase" 
                                          color="#bb86fc"
                                          uncheckedColor="#fff"
                                          labelStyle={styles.whiteText}
                                          status={modifyAction === 'increase' ? 'checked' : 'unchecked'}
                                          onPress={() => setModifyAction('increase')}
                                        />
                                        <RadioButton.Item 
                                          label={t.decrease} 
                                          value="decrease" 
                                          color="#bb86fc"
                                          uncheckedColor="#fff"
                                          labelStyle={styles.whiteText}
                                          status={modifyAction === 'decrease' ? 'checked' : 'unchecked'}
                                          onPress={() => setModifyAction('decrease')}
                                        />
                                      </View>
                                    </>
                                  ) : null}
                                  {modifyStep === 'amount' ? (
                                    <>
                                      <Text style={[styles.label, styles.whiteText]}>{t.amount}</Text>
                                      <Text style={[styles.label, styles.whiteText]}>{t.package}</Text>
                                      <View style={styles.radioContainer}>
                                        <RadioButton.Item 
                                          label={t.yes} 
                                          value="yes" 
                                          color="#bb86fc"
                                          uncheckedColor="#fff"
                                          labelStyle={styles.whiteText}
                                          status={isPackage === 'yes' ? 'checked' : 'unchecked'}
                                          onPress={() => setIsPackage('yes')}
                                        />
                                        <RadioButton.Item 
                                          label={t.no} 
                                          value="no" 
                                          color="#bb86fc"
                                          uncheckedColor="#fff"
                                          labelStyle={styles.whiteText}
                                          status={isPackage === 'no' ? 'checked' : 'unchecked'}
                                          onPress={() => setIsPackage('no')}
                                        />
                                      </View>
                                      
                                      {isPackage === 'yes' ? (
                                        <>
                                          <TextInput
                                            label={t.numberOfPackages}
                                            value={numberOfPackages}
                                            onChangeText={setNumberOfPackages}
                                            keyboardType="numeric"
                                            style={styles.input}
                                            theme={{ colors: { primary: '#bb86fc', text: '#fff', placeholder: '#aaa', background: 'transparent' } }}
                                            mode="outlined"
                                            onSubmitEditing={dismissKeyboard}
                                            returnKeyType="done"
                                          />
                                          <TextInput
                                            label={t.itemsPerPackage}
                                            value={itemsPerPackage}
                                            onChangeText={setItemsPerPackage}
                                            keyboardType="numeric"
                                            style={styles.input}
                                            theme={{ colors: { primary: '#bb86fc', text: '#fff', placeholder: '#aaa', background: 'transparent' } }}
                                            mode="outlined"
                                            onSubmitEditing={dismissKeyboard}
                                            returnKeyType="done"
                                          />
                                          <Text style={[styles.totalText, styles.whiteText]}>
                                            {t.totalItems}: {numberOfPackages && itemsPerPackage 
                                              ? Math.floor(parseInt(numberOfPackages) * parseInt(itemsPerPackage))
                                              : 0}
                                          </Text>
                                        </>
                                      ) : (
                                        <TextInput
                                          label={t.numberOfItems}
                                          value={numberOfItems}
                                          onChangeText={setNumberOfItems}
                                          keyboardType="numeric"
                                          style={styles.input}
                                          theme={{ colors: { primary: '#bb86fc', text: '#fff', placeholder: '#aaa', background: 'transparent' } }}
                                          mode="outlined"
                                          onSubmitEditing={dismissKeyboard}
                                          returnKeyType="done"
                                        />
                                      )}
                                    </>
                                  ) : null}
                                  {modifyStep === 'type' ? (
                                    <>
                                      <Text style={[styles.label, styles.whiteText]}>{t.itemType}</Text>
                                      <Menu
                                        visible={itemTypeMenuVisible}
                                        onDismiss={() => setItemTypeMenuVisible(false)}
                                        anchor={
                                          <Button 
                                            onPress={() => setItemTypeMenuVisible(true)}
                                            mode="outlined"
                                            style={styles.typeButtonModal}
                                            contentStyle={styles.typeButtonContent}
                                            textColor="#fff"
                                          >
                                            <Text style={[styles.whiteText, styles.centeredText]}>{itemType}</Text>
                                          </Button>
                                        }
                                        contentStyle={styles.menuContentModal}
                                      >
                                        {itemTypes.map(type => (
                                          <Menu.Item
                                            key={type}
                                            onPress={() => {
                                              setItemType(type);
                                              setItemTypeMenuVisible(false);
                                            }}
                                            title={type}
                                            titleStyle={styles.whiteText}
                                          />
                                        ))}
                                      </Menu>
                                    </>
                                  ) : null}
                                </>
                              )}
                            </View>
                          </ScrollView>
                          <View style={styles.buttonContainer}>
                            {modalType === 'add' ? (
                              <>
                                <Button 
                                  onPress={() => {
                                    setVisible(false);
                                    dismissKeyboard();
                                  }} 
                                  textColor="#fff"
                                  style={styles.cancelButton}
                                >
                                  {t.cancel}
                                </Button>
                                <Button 
                                  onPress={handleAddSubmit} 
                                  mode="contained"
                                  style={styles.submitButton}
                                  labelStyle={styles.submitButtonLabel}
                                >
                                  {t.submit}
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button 
                                  onPress={() => {
                                    setVisible(false);
                                    dismissKeyboard();
                                  }} 
                                  textColor="#fff"
                                  style={styles.cancelButton}
                                >
                                  {t.cancel}
                                </Button>
                                {modifyStep === 'action' && (
                                  <Button 
                                    onPress={() => setModifyStep('amount')} 
                                    mode="contained"
                                    style={styles.submitButton}
                                    labelStyle={styles.submitButtonLabel}
                                  >
                                    {t.next}
                                  </Button>
                                )}
                                {modifyStep === 'amount' && (
                                  <>
                                    <Button 
                                      onPress={() => setModifyStep('action')} 
                                      textColor="#fff"
                                      style={styles.cancelButton}
                                    >
                                      {t.previous}
                                    </Button>
                                    <Button 
                                      onPress={handleAmountNext} 
                                      mode="contained"
                                      style={styles.submitButton}
                                      labelStyle={styles.submitButtonLabel}
                                    >
                                      {t.next}
                                    </Button>
                                  </>
                                )}
                                {modifyStep === 'type' && (
                                  <>
                                    <Button 
                                      onPress={() => setModifyStep('amount')} 
                                      textColor="#fff"
                                      style={styles.cancelButton}
                                    >
                                      {t.previous}
                                    </Button>
                                    <Button 
                                      onPress={handleModifySubmit} 
                                      mode="contained"
                                      style={styles.submitButton}
                                      labelStyle={styles.submitButtonLabel}
                                    >
                                      {t.submit}
                                    </Button>
                                  </>
                                )}
                              </>
                            )}
                          </View>
                        </View>
                      </View>
                    </KeyboardAvoidingView>
                  </View>
                </PaperProvider>
              </RNModal>

              <Dialog
                visible={isLanguageDialogVisible}
                onDismiss={() => setIsLanguageDialogVisible(false)}
                style={styles.dialog}
              >
                <Dialog.Title style={styles.blackText}>{t.selectLanguage}</Dialog.Title>
                <Dialog.Content>
                  <RadioButton.Group onValueChange={handleLanguageChange} value={language}>
                    <RadioButton.Item 
                      label={t.english} 
                      value="en" 
                      color="#6200ee"
                      labelStyle={styles.blackText}
                    />
                    <RadioButton.Item 
                      label={t.traditionalChinese} 
                      value="zh-HK" 
                      color="#6200ee"
                      labelStyle={styles.blackText}
                    />
                    <RadioButton.Item 
                      label={t.simplifiedChinese} 
                      value="zh-CN" 
                      color="#6200ee"
                      labelStyle={styles.blackText}
                    />
                  </RadioButton.Group>
                </Dialog.Content>
                <Dialog.Actions>
                  <Button onPress={() => setIsLanguageDialogVisible(false)} textColor="#000">{t.save}</Button>
                </Dialog.Actions>
              </Dialog>
            </View>
          </TouchableWithoutFeedback>
        </SafeAreaView>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  appBar: {
    height: 30,
    backgroundColor:'black'
  },
  searchContainer: {
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  searchbar: {
    backgroundColor: '#fff',
  },
  typeFilterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  listItem: {
    backgroundColor: 'white',
    marginBottom: 5,
    borderRadius: 5,
    elevation: 1,
  },
  selectedItem: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
    borderWidth: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  itemDetails: {
    marginTop: 5,
  },
  itemDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  modifyButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modifyButton: {
    backgroundColor: '#FFA500',
    borderRadius: 5,
    height: 36,
    justifyContent: 'center',
  },
  modifyButtonLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
  fullScreenModal: {
    flex: 1,
    backgroundColor: '#333',
  },
  fullScreenView: {
    backgroundColor: '#333',
    flex: 1,
    borderRadius: 0,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalContentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
  },
  input: {
    marginBottom: 10,
    backgroundColor: 'transparent',
  },
  generatedId: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    marginTop: 10,
    fontWeight: 'bold',
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  typeButton: {
    marginBottom: 15,
    borderColor: '#6200ee',
    backgroundColor: 'white',
  },
  typeButtonModal: {
    marginBottom: 15,
    borderColor: '#bb86fc',
    backgroundColor: 'transparent',
  },
  typeButtonContent: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  menuContent: {
    backgroundColor: 'white',
  },
  menuContentModal: {
    backgroundColor: '#333',
  },
  blackText: {
    color: '#000000',
  },
  whiteText: {
    color: '#ffffff',
  },
  centeredText: {
    textAlign: 'center',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    marginHorizontal: 5,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  submitButtonLabel: {
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#444',
    backgroundColor: '#333',
  },
  dialog: {
    backgroundColor: 'white',
  },
  loadingContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
  currentDetails: {
    fontSize: 14,
    marginBottom: 20,
  },
  keyboardAvoid: {
    flex: 1,
    width: '100%',
  },
});

export default App;