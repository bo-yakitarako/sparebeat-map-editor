import React from 'react';
import styled, { css } from 'styled-components';
import { useSelector } from 'react-redux';
import { AppState } from '../../store';
import { DifficlutySelect } from 'modules/editorModule';
import { IRgb } from './BackgroundColorPicker';

export const SparebeatStartMenu: React.FC<{ top: IRgb, bottom: IRgb }> = ({ top, bottom }) => {
    const { bpm, title, artist, level } = useSelector(({ easy, info }: AppState) => ({
        bpm: easy.lines[0].bpm,
        ...info,
    }));
    const color = `linear-gradient(rgba(${top.r}, ${top.g}, ${top.b}, .8), rgba(${bottom.r}, ${bottom.g}, ${bottom.b}, .8))`;
    return (
        <Wrapper>
            <BackgroundImage alt="" src="/media/polygon.png" />
            <BackgroundColor color={color} />
            <StartScene>
                <Title>{title}</Title>
                <Artist>{artist}</Artist>
                <LevelSelector>
                    {Object.keys(level).map((diff) => (
                        <LevelBox key={diff} difficulty={diff}>
                            <LevelLabel>LEVEL</LevelLabel>
                            <LevelNumber>
                                {level[diff as DifficlutySelect].length === 0 ? '　' : level[diff as DifficlutySelect]}
                            </LevelNumber>
                            <LevelLabel>{diff.toUpperCase()}</LevelLabel>
                        </LevelBox>
                    ))}
                </LevelSelector>
                <Footer>
                    <StartSpeed>
                        <ArrowButton>{'<'}</ArrowButton>
                        <span>Speed x1.00</span>
                        <ArrowButton>{'>'}</ArrowButton>
                    </StartSpeed>
                    <BpmLabel>BPM:{bpm}</BpmLabel>
                    <StartTiming>
                        <ArrowButton>{'<'}</ArrowButton>
                        <span>Timing ±0.00</span>
                        <ArrowButton>{'>'}</ArrowButton>
                    </StartTiming>
                </Footer>
            </StartScene>
            <BackDrop />
        </Wrapper>
    );
};

const Wrapper = styled.div`
    position: relative;
    display: inline-block;
    width: 480px;
    height: 320px;
    margin-top: 15px;
`;

const BackgroundImage = styled.img`
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    z-index: 0;
`;

const SceneSizing = css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
`;

const BackgroundColor = styled.div<{ color: string }>`
    background-image: ${({ color }) => color};
    z-index: 1;
    ${SceneSizing}
`;

const StartScene = styled.div`
    ${SceneSizing}
    overflow: hidden;
    z-index: 3;
`;

const BackDrop = styled.div`
    ${SceneSizing}
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 2;
`;

const HeaderText = css`
    display: block;
	color: #fff;
	text-align: center;
	font-weight: 700;
	overflow-x: hidden;
	overflow-y: visible;
	margin: 0;
`;

const Title = styled.p`
    ${HeaderText}
    margin-top: 20px;
	height: 40px;
	line-height: 40px;
	font-size: 21px;
`;

const Artist = styled.p`
    ${HeaderText}
    height: 15px;
	line-height: 15px;
	font-size: 10px;
`;

const LevelSelector = styled.div`
    width: 480px;
	height: 120px;
	padding: 10px 0;
	position: absolute;
	top: 90px;
	left: 0;
`;

const difficultyColor = (difficulty: string) => {
    switch (difficulty) {
        case 'easy':
            return '#1abc9c';
        case 'normal':
            return '#f1c40f';
        default:
            return '#c0392b';
    }
};
const LevelBox = styled.div<{ difficulty: string }>`
    position: relative;
	float: left;
	width: 120px;
	height: 120px;
	padding: 10px;
    margin-left: 30px;
    background-color: hsla(0, 0%, 100%, 0.8);
    color: ${({ difficulty }) => difficultyColor(difficulty)};
`;

const LevelNumber = styled.div`
    font-family: Russo One, sans-serif;
	text-align: center;
    font-size: 48px;
`;

const LevelLabel = styled(LevelNumber)`
    font-size: 16px;
`;

const Footer = styled.div`
    width: 480px;
	height: 90px;
	line-height: 90px;
	position: absolute;
	top: 230px;
	left: 0;
	text-align: center;
`;

const BpmLabel = styled.span`
    position: relative;
	display: inline;
	color: #fff;
	font-family: Nova Mono, sans-serif;
	font-size: 12px;
	font-weight: 700;
`;

const OptionLabel = css`
    width: 240px;
	height: 90px;
	line-height: 90px;
	position: absolute;
	bottom: 0;
	color: #fff;
	text-align: center;
	font-family: Nova Mono, sans-serif;
	font-size: 16px;
	font-weight: 700;
`;

const StartSpeed = styled.div`
    ${OptionLabel}
    left: 0;
`;

const StartTiming = styled.div`
    ${OptionLabel}
    right: 0;
`;

const ArrowButton = styled.span`
    margin: 0 7px;
	padding: 2.5px 7px;
	background: hsla(0, 0%, 100%, 0.5);
`;
