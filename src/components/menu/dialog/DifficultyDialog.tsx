import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import { Dialog, Classes, Button, InputGroup, MenuItem } from '@blueprintjs/core';
import { useSelector, useDispatch } from 'react-redux';
import { AppState } from 'store';
import editorModule, { DifficlutySelect } from 'modules/editorModule';
import { Props, Event } from './SongInfoDialog';
import { Select, ItemRenderer } from '@blueprintjs/select';

const {
    saveSetting,
    toggleMusic,
    changeDifficulty,
    updateCurrentTime,
    updateBarPos,
    updateLevel,
    deleteMap,
    cloneDifficulty,
} = editorModule.actions;

interface IDiffWindow {
    difficulty: DifficlutySelect;
}
const DiffWindow: React.FC<IDiffWindow> = ({ difficulty }) => {
    const dispatch = useDispatch();
    const { current, info: { level } } = useSelector((state: AppState) => state);
    return (
        <DiffWindowWrapper difficulty={difficulty}>
            <StyledButton
                active={current === difficulty}
                text={difficulty.toUpperCase()}
                onClick={() => {
                    if (current !== difficulty) {
                        dispatch(changeDifficulty(difficulty));
                        dispatch(updateCurrentTime(0));
                        dispatch(updateBarPos(0));
                    }
                }}
            />
            <StyledInput
                value={level[difficulty].toString()}
                onChange={(event: Event) => {
                    dispatch(updateLevel({ difficulty, value: event.currentTarget.value }));
                }}
            />
            <StyledButton
                bottom="true"
                intent="danger"
                text="リセット"
                onClick={() => {
                    dispatch(deleteMap(difficulty));
                }}
            />
        </DiffWindowWrapper>
    );
};

interface ICloneSelect {
    index: number;
    difficulty: DifficlutySelect;
}

const cloneSelects = (['easy', 'normal', 'hard'] as DifficlutySelect[])
    .map((difficulty, index) =>({ difficulty, index }));
const CloneSelect = Select.ofType<ICloneSelect>();
type SelectDispatch = React.Dispatch<React.SetStateAction<DifficlutySelect>>;

interface ICloneSelector {
    me: DifficlutySelect;
    opponent: DifficlutySelect;
    origin: DifficlutySelect;
    changeOrigin: SelectDispatch;
    changeTarget: SelectDispatch;
}

const CloneSelector: React.FC<ICloneSelector> = ({
    me,
    opponent,
    origin,
    changeOrigin,
    changeTarget,
}) => {
    const renderItem: ItemRenderer<ICloneSelect> = (
        { difficulty, index },
        { handleClick }
    ) => (
        <MenuItem
            key={index}
            active={me === difficulty}
            disabled={opponent === difficulty}
            text={difficulty.toUpperCase()}
            onClick={handleClick}
        />
    );
    const handleSelect = useCallback(({ difficulty }: ICloneSelect) => {
        if (me === origin) {
            changeOrigin(() => difficulty);
        } else {
            changeTarget(() => difficulty);
        }
    }, [changeOrigin, changeTarget, me, origin]);

    return (
        <CloneSelect
            items={cloneSelects}
            itemRenderer={renderItem}
            onItemSelect={handleSelect}
            filterable={false}
        >
            <Button text={me.toUpperCase()} rightIcon="caret-down" />
        </CloneSelect>
    );
};

export const DifficultyDialog: React.FC<Props> = ({ isOpen, handleState }) => {
    const dispatch = useDispatch();
    const { themeDark, playing } = useSelector((state: AppState) => state);

    const [origin, changeOrigin] = useState('easy' as DifficlutySelect);
    const [target, changeTarget] = useState('normal' as DifficlutySelect);

    return (
        <Dialog
            className={themeDark ? Classes.DARK : ''}
            isOpen={isOpen}
            title="難易度変更"
            onClose={handleState}
            onOpened={() => {
                dispatch(saveSetting());
                if (playing) {
                    dispatch(toggleMusic());
                }
            }}
        >
            <DialogBody className={Classes.DIALOG_BODY}>
                <WindowWrapper>
                    <DiffWindow difficulty="easy" />
                    <DiffWindow difficulty="normal" />
                    <DiffWindow difficulty="hard" />
                </WindowWrapper>
                <div>
                    <CloneSelector 
                        me={origin}
                        opponent={target}
                        origin={origin}
                        changeOrigin={changeOrigin}
                        changeTarget={changeTarget}
                    />
                    譜面から
                    <CloneSelector
                        me={target}
                        opponent={origin}
                        origin={origin}
                        changeOrigin={changeOrigin}
                        changeTarget={changeTarget}
                    />
                    譜面へ
                    <Button text="コピー" onClick={() => {
                        dispatch(cloneDifficulty({ origin, target }));
                    }} />
                </div>
            </DialogBody>
        </Dialog>
    );
};

const DialogBody = styled.div`
    text-align: center;
`;

const WindowWrapper = styled.div`
    margin-bottom: 10%;
`;

const DiffWindowWrapper = styled.div<IDiffWindow>`
    display: inline-block;
    width: 25%;
    margin: 0 ${({ difficulty }) => difficulty === 'normal' ? '5%' : '0'};
`;

const StyledButton = styled(Button)<{ bottom?: string }>`
    width: 100%;
    ${({ bottom }) => bottom === 'true' && 'margin-top: 10%;'};
`;

const StyledInput = styled(InputGroup)`
    input {
        text-align: center;
    }
`;
