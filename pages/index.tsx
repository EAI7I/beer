import s from '../styles/Home.module.scss';

import type {NextPage} from 'next';
import Head from 'next/head';

import React, {ChangeEvent, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {getBeers, getFoundBeer} from '../core/api/api';
import {BeerCard} from "../components/BeerCard/BeerCard";
import {Header} from '../components/Header/Header';
import {Preloader} from "../components/Preloader/Preloader";
import Pagination from '../components/Pagination/Pagination';
import {Context} from "../hooks/context";
import {BeerList} from '../core/interfaces/beerList';


const Home: NextPage = () => {

    const [beerList, setBeerList] = useState<BeerList[] | []>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [search, setSearch] = useState<BeerList[] | []>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showResetBtn, setShowResetBtn] = useState<boolean>(false);
    const [notFound, setNotFound] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);

    const inputRef = useRef<HTMLInputElement | null>(null);

    const onSearch = async (e: ChangeEvent<HTMLInputElement> & KeyboardEvent) => {
        if (e.key === 'Enter') {
            const value = e.target.value;
            setCurrentPage(1);
            setNotFound(false);
            setLoading(false);
            if (value.length !== 0) {
                await getFoundBeer(value)
                    .then(result => {
                        if (result.data.length > 0) {
                            setSearch(result.data);
                            setShowResetBtn(true);
                            setLoading(true);
                        } else {
                            setNotFound(true);
                            setShowResetBtn(true);
                            setLoading(true);
                        }
                    })
                    .catch(e => setError(true));
            } else if (!value) {
                setSearch([]);
                setShowResetBtn(false);
                setLoading(true);
            }
        }
    };

    const currentBeers = useMemo(() => {
        const firstPageIndex = (currentPage - 1) * 16;
        const lastPageIndex = +firstPageIndex + 16;
        if (search.length > 0) {
            return search.slice(firstPageIndex, lastPageIndex);
        } else {
            return beerList;
        }
    }, [currentPage, search, beerList]);

    const onResetSearch = () => {
        setSearch([]);
        setNotFound(false);
        setShowResetBtn(false);
        if (inputRef.current)
            inputRef.current.value = '';
    };

    useEffect(() => {
        if (search.length === 0) {
            setLoading(false);
            search.length === 0 &&
            getBeers(currentPage)
                .then(result => {
                    setBeerList(result.data);
                    setLoading(true);
                })
                .catch(e => setError(true));
        }
        window.scroll(0, 0);
    }, [currentPage]);

    return (
        <div className={s.container}>
            <Head>
                <title>Beer</title>
                <meta name="description" content="Generated by create next app"/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>

            <header>
                <Context.Provider value={{onSearch: onSearch, inputRef: inputRef}}>
                    <Header type={"list"} showResetBtn={showResetBtn} onResetSearch={onResetSearch}/>
                </Context.Provider>
            </header>

            <main className={s.main}>
                {loading && !notFound && currentBeers.map(beer => (
                    <BeerCard id={beer.id} src={beer.image_url} name={beer.name} description={beer.description}/>))}
                {!loading && !error && < Preloader/>}
                {notFound && <div className={s.not_found}><h2>Sorry, not found :(</h2></div>}
                {error && <div className={s.not_found}><h2>Sorry, something went wrong...</h2></div>}
            </main>

            <footer className={s.footer}>
                <Pagination
                    currentPage={currentPage}
                    totalCount={search.length === 0 ? 325 : search.length}
                    siblingCount={1}
                    pageSize={16}
                    onPageChange={(page: number) => setCurrentPage(page)}
                    search={search}
                    notFound={notFound}
                    errors={error}
                />
            </footer>
        </div>
    )
}

export default Home;