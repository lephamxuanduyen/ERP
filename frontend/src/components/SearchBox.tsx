import React, { useState, useEffect } from 'react';
import { InputGroup, Input, Menu, Flex, Separator, Text, Button, Portal } from '@chakra-ui/react';
import { CiSearch, CiSquareChevDown } from "react-icons/ci";

type SearchBoxProps = {
    placeholder?: string;
    filterOptions?: string[];
    selectedFilter?: string;
    onSearchChange?: (value: string) => void;
    onFilterSelect?: (value: string) => void;
    onEnter?: (inputValue: string, filterValue?: string) => void; // 🆕
};

const SearchBox: React.FC<SearchBoxProps> = ({
    placeholder = 'Search',
    filterOptions = [],
    selectedFilter,
    onSearchChange,
    onFilterSelect,
    onEnter,
}) => {
    const showFilter = filterOptions && filterOptions.length > 0;

    const [inputValue, setInputValue] = useState('');
    const [internalFilter, setInternalFilter] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (showFilter && !selectedFilter && !internalFilter && filterOptions.length > 0) {
            setInternalFilter(filterOptions[0]);
            onFilterSelect?.(filterOptions[0]);
        }
    }, [filterOptions, selectedFilter, internalFilter, onFilterSelect, showFilter]);

    const handleSelect = (item: string) => {
        setInternalFilter(item);
        onFilterSelect?.(item);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        onSearchChange?.(value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onEnter?.(inputValue, selectedFilter || internalFilter);
        }
    };

    return (
        <Flex
            bg="white"
            borderRadius="md"
            p="2"
            boxShadow="0px 5px 90px 0px rgba(0, 0, 0, 0.20)"
            alignItems="center"
            w="100%"
            maxW="500px"
        >
            <InputGroup
                startElement={<CiSearch color="gray.400" fontSize={'25px'} />}>
                <Input
                    placeholder={placeholder}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    border={'none'}
                    _focus={{ 
                        boxShadow: 'none',
                        outline: 'none' ,
                    }}
                />
            </InputGroup>

            {showFilter && (
                <>
                    <Separator
                        orientation="vertical"
                        h="24px"
                        mx={2}
                        borderColor="gray.600"
                        borderWidth="1px"
                    />

                    <Menu.Root>
                        <Menu.Trigger asChild>
                            <Button
                                p={"20px"}
                                variant="ghost"
                                aria-label="Filter"
                                display="flex"
                                alignItems="center"
                                gap="2"
                                _focus={{ 
                                    boxShadow: 'none',
                                    outline: 'none' 
                                }}
                            >
                                <Text fontSize={"sm"} color={"gray.600"}>
                                    {selectedFilter || internalFilter}
                                </Text>
                                <CiSquareChevDown />
                            </Button>

                            {/* <IconButton
                            p="20px"
                            as={IconButton}
                            variant="ghost"
                            _icon={{
                                as: () => (
                                  <Flex alignItems="center" gap={1}>
                                    <Text fontSize="sm" color="gray.600">
                                      {selectedFilter || internalFilter}
                                    </Text>
                                    <CiSquareChevDown />
                                  </Flex>
                                ),
                              }}
                            aria-label="Filter"
                        /> */}
                        </Menu.Trigger>
                        <Portal>
                            <Menu.Positioner>
                                <Menu.Content>

                                    {filterOptions.map((item) => (
                                        <Menu.Item key={item} value={item} onClick={() => handleSelect(item)}>
                                            {item}
                                        </Menu.Item>
                                    ))}
                                </Menu.Content>
                            </Menu.Positioner>
                        </Portal>
                        {/* <MenuList>
                            {filterOptions.map((item) => (
                                <MenuItem key={item} onClick={() => handleSelect(item)}>
                                    {item}
                                </MenuItem>
                            ))}
                        </MenuList> */}
                    </Menu.Root>
                </>
            )}
        </Flex>
    );
};

export default SearchBox;

